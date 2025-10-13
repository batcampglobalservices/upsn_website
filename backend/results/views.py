from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import HttpResponse
from django.db.models import Q
from .models import Result, AcademicSession, ResultSummary
from .serializers import (
    ResultSerializer, ResultCreateSerializer, AcademicSessionSerializer,
    ResultSummarySerializer, BulkResultCreateSerializer
)
from accounts.permissions import IsAdmin, IsAdminOrTeacher, IsStudent
from .utils import generate_result_pdf


class AcademicSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AcademicSession CRUD operations
    """
    queryset = AcademicSession.objects.all()
    serializer_class = AcademicSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active academic session"""
        active_session = AcademicSession.objects.filter(is_active=True).first()
        if active_session:
            serializer = self.get_serializer(active_session)
            return Response(serializer.data)
        return Response({'error': 'No active session found'}, status=status.HTTP_404_NOT_FOUND)


class ResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Result CRUD operations
    Admin: Full access
    Teacher: Can create/edit results for their assigned classes
    Student: Read-only access to their own results
    """
    queryset = Result.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'subject', 'session', 'term', 'grade']
    search_fields = ['student__full_name', 'subject__name']
    ordering_fields = ['created_at', 'total']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update']:
            return ResultCreateSerializer
        return ResultSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Result.objects.all()
        elif user.role == 'teacher':
            # Teachers can see results for students in their assigned classes
            from classes.models import Class
            teacher_classes = Class.objects.filter(assigned_teacher=user)
            return Result.objects.filter(
                student__student_profile__student_class__in=teacher_classes
            )
        elif user.role == 'student':
            # Students can only see their own results
            return Result.objects.filter(student=user)
        return Result.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAdminOrTeacher()]
        elif self.action == 'destroy':
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Create multiple results at once"""
        serializer = BulkResultCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session = serializer.validated_data['session']
        term = serializer.validated_data['term']
        subject = serializer.validated_data['subject']
        results_data = serializer.validated_data['results']
        
        created_results = []
        errors = []
        
        for result_data in results_data:
            try:
                result, created = Result.objects.update_or_create(
                    student_id=result_data['student_id'],
                    subject=subject,
                    session=session,
                    term=term,
                    defaults={
                        'test_score': result_data['test_score'],
                        'exam_score': result_data['exam_score'],
                        'teacher_comment': result_data.get('teacher_comment', '')
                    }
                )
                created_results.append(result)
            except Exception as e:
                errors.append({
                    'student_id': result_data.get('student_id'),
                    'error': str(e)
                })
        
        return Response({
            'message': f'{len(created_results)} results created/updated successfully',
            'created': len(created_results),
            'errors': errors
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_results(self, request):
        """Get results for the logged-in student"""
        if request.user.role != 'student':
            return Response(
                {'error': 'This endpoint is only for students'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        session_id = request.query_params.get('session')
        term = request.query_params.get('term')
        
        results = Result.objects.filter(student=request.user)
        
        if session_id:
            results = results.filter(session_id=session_id)
        if term:
            results = results.filter(term=term)
        
        serializer = self.get_serializer(results, many=True)
        return Response(serializer.data)


class ResultSummaryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ResultSummary operations
    """
    queryset = ResultSummary.objects.all()
    serializer_class = ResultSummarySerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'session', 'term']
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return ResultSummary.objects.all()
        elif user.role == 'teacher':
            # Teachers can see summaries for students in their assigned classes
            from classes.models import Class
            teacher_classes = Class.objects.filter(assigned_teacher=user)
            return ResultSummary.objects.filter(
                student__student_profile__student_class__in=teacher_classes
            )
        elif user.role == 'student':
            return ResultSummary.objects.filter(student=user)
        return ResultSummary.objects.none()
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrTeacher()]
        return [IsAuthenticated()]
    
    @action(detail=True, methods=['post'])
    def calculate(self, request, pk=None):
        """Recalculate summary from results"""
        summary = self.get_object()
        summary.calculate_summary()
        serializer = self.get_serializer(summary)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        """Generate and download result PDF"""
        summary = self.get_object()
        
        # Generate PDF
        pdf_buffer = generate_result_pdf(summary)
        
        # Return PDF as response
        response = HttpResponse(pdf_buffer.getvalue(), content_type='application/pdf')
        filename = f"Result_{summary.student.username}_{summary.term}_{summary.session.name.replace('/', '-')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
    
    @action(detail=False, methods=['post'])
    def generate_summary(self, request):
        """Generate summary for a student, session, and term"""
        student_id = request.data.get('student')
        session_id = request.data.get('session')
        term = request.data.get('term')
        
        if not all([student_id, session_id, term]):
            return Response(
                {'error': 'student, session, and term are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        summary, created = ResultSummary.objects.get_or_create(
            student_id=student_id,
            session_id=session_id,
            term=term
        )
        
        summary.calculate_summary()
        serializer = self.get_serializer(summary)
        
        return Response({
            'message': 'Summary generated successfully',
            'summary': serializer.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

