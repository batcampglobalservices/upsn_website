from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Class, Subject
from .serializers import ClassSerializer, ClassListSerializer, SubjectSerializer
from accounts.permissions import IsAdmin, IsAdminOrTeacher


class ClassViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Class CRUD operations
    Admin: Full access
    Teacher: View only their assigned classes
    Student: View their own class
    """
    queryset = Class.objects.all()
    permission_classes = [IsAuthenticated]
    filterset_fields = ['level', 'assigned_teacher']
    search_fields = ['name', 'level']
    ordering_fields = ['name', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ClassListSerializer
        return ClassSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Class.objects.all()
        elif user.role == 'teacher':
            return Class.objects.filter(assigned_teacher=user)
        elif user.role == 'student':
            # Students see only their own class
            try:
                student_profile = user.student_profile
                if student_profile.student_class:
                    return Class.objects.filter(id=student_profile.student_class.id)
            except:
                pass
        return Class.objects.none()
    
    @action(detail=True, methods=['get'])
    def students(self, request, pk=None):
        """Get all students in a class"""
        class_obj = self.get_object()
        from accounts.serializers import StudentProfileSerializer
        students = class_obj.students.all()
        serializer = StudentProfileSerializer(students, many=True)
        return Response(serializer.data)


class SubjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subject CRUD operations
    Admin: Full access
    Teacher: Can create, view, and update subjects they teach or in their assigned classes
    """
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['assigned_class', 'assigned_teacher']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'created_at']
    
    def get_permissions(self):
        # Allow both admins and teachers to create/update subjects
        if self.action in ['create', 'update', 'partial_update']:
            return [IsAdminOrTeacher()]
        elif self.action == 'destroy':
            # Only admins can delete subjects
            return [IsAdmin()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Subject.objects.all()
        elif user.role == 'teacher':
            # Teachers can see subjects in their assigned classes or subjects they teach
            return Subject.objects.filter(
                models.Q(assigned_teacher=user) | 
                models.Q(assigned_class__assigned_teacher=user)
            ).distinct()
        elif user.role == 'student':
            # Students see subjects in their class
            try:
                student_profile = user.student_profile
                if student_profile.student_class:
                    return Subject.objects.filter(assigned_class=student_profile.student_class)
            except:
                pass
        return Subject.objects.none()


from django.db import models

