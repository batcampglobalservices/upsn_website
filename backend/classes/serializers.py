from rest_framework import serializers
from .models import Class, Subject


class SubjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Subject model
    """
    assigned_class_name = serializers.CharField(source='assigned_class.name', read_only=True)
    assigned_teacher_name = serializers.CharField(source='assigned_teacher.full_name', read_only=True)
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'assigned_class', 'assigned_class_name', 
                  'assigned_teacher', 'assigned_teacher_name', 'description', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ClassSerializer(serializers.ModelSerializer):
    """
    Serializer for Class model
    """
    assigned_teacher_name = serializers.CharField(source='assigned_teacher.full_name', read_only=True)
    subjects = SubjectSerializer(many=True, read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'level', 'assigned_teacher', 'assigned_teacher_name', 
                  'description', 'subjects', 'student_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_student_count(self, obj):
        return obj.students.count()


class ClassListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for class lists
    """
    assigned_teacher_name = serializers.CharField(source='assigned_teacher.full_name', read_only=True)
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'level', 'assigned_teacher', 'assigned_teacher_name', 
                  'student_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_student_count(self, obj):
        return obj.students.count()
