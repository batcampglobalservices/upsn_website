from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, StudentProfile


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for CustomUser model
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    student_profile = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'full_name', 'role', 'email', 
                  'phone_number', 'profile_image', 'is_active', 'student_profile', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'student_profile']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False, 'allow_blank': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def validate_password(self, value):
        """Only validate password if it's provided and not blank"""
        if value and value.strip():
            validate_password(value)
            return value
        return value
    
    def validate_email(self, value):
        """Convert empty string to None for email uniqueness"""
        if not value or not value.strip():
            return None
        return value
    
    def validate_phone_number(self, value):
        """Convert empty string to None for phone_number"""
        if not value or not value.strip():
            return None
        return value
    
    def validate_username(self, value):
        """Validate username is numeric and unique (excluding current instance)"""
        if not value or not value.strip():
            raise serializers.ValidationError("Username is required")
        
        # Check if username already exists (excluding current instance during update)
        instance = self.instance
        if instance:
            # This is an update - check if username changed and if new username exists
            if instance.username != value:
                if CustomUser.objects.filter(username=value).exclude(id=instance.id).exists():
                    raise serializers.ValidationError("A user with this username already exists")
        else:
            # This is a create - just check if username exists
            if CustomUser.objects.filter(username=value).exists():
                raise serializers.ValidationError("A user with this username already exists")
        
        return value
    
    def get_student_profile(self, obj):
        """Return student profile data if user is a student"""
        if obj.role == 'student':
            try:
                profile = obj.student_profile
                return {
                    'id': profile.id,
                    'student_class': profile.student_class.id if profile.student_class else None,
                    'student_class_name': profile.student_class.name if profile.student_class else None,
                    'admission_number': profile.admission_number,
                }
            except StudentProfile.DoesNotExist:
                return None
        return None
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        
        # Handle empty email
        if 'email' in validated_data and not validated_data['email']:
            validated_data['email'] = None
            
        user = CustomUser.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        
        # Auto-create StudentProfile if role is student
        if user.role == 'student':
            StudentProfile.objects.create(user=user)
        
        return user
    
    def update(self, instance, validated_data):
        # Only admin can update username and password
        request = self.context.get('request')
        if request and request.user.role != 'admin':
            validated_data.pop('username', None)
            validated_data.pop('password', None)
        
        # Remove password from validated_data (will handle separately)
        password = validated_data.pop('password', None)
        
        # Handle empty email - convert to None
        if 'email' in validated_data and not validated_data['email']:
            validated_data['email'] = None
        
        # Handle empty phone_number - convert to None
        if 'phone_number' in validated_data and not validated_data['phone_number']:
            validated_data['phone_number'] = None
        
        # Update all other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Only set password if it's provided
        if password and password.strip():
            instance.set_password(password)
        
        instance.save()
        
        # Auto-create StudentProfile if role changed to student and profile doesn't exist
        if instance.role == 'student':
            StudentProfile.objects.get_or_create(user=instance)
        
        return instance


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentProfile model
    """
    user = UserSerializer(read_only=True)
    class_name = serializers.CharField(source='student_class.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = ['id', 'user', 'student_class', 'class_name', 'admission_number', 
                  'date_of_birth', 'guardian_name', 'guardian_phone', 'address']


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login endpoint
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new users (Admin only)
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'full_name', 'role', 
                  'email', 'phone_number', 'profile_image']
        extra_kwargs = {
            'username': {'required': True},
            'full_name': {'required': True},
            'role': {'required': True},
            'email': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        
        # Handle empty email - convert to None
        if 'email' in validated_data and not validated_data['email']:
            validated_data['email'] = None
        
        # Handle empty phone_number - convert to None
        if 'phone_number' in validated_data and not validated_data['phone_number']:
            validated_data['phone_number'] = None
            
        user = CustomUser.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        # Auto-create StudentProfile if role is student
        if user.role == 'student':
            StudentProfile.objects.create(user=user)
        
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile view
    """
    student_profile = StudentProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'full_name', 'role', 'email', 'phone_number', 
                  'profile_image', 'student_profile', 'is_active']
        read_only_fields = ['id', 'username', 'role']
