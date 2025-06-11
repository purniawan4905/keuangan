import connectDB from '../lib/database';
import User, { IUser } from '../models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'finance' | 'viewer';
  hospitalId: string;
}

export interface AuthResponse {
  success: boolean;
  user?: Omit<IUser, 'password'>;
  token?: string;
  message?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      await connectDB();

      const { email, password } = credentials;

      // Find user by email
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        isActive: true 
      });

      if (!user) {
        return {
          success: false,
          message: 'Email atau password salah'
        };
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Email atau password salah'
        };
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          role: user.role,
          hospitalId: user.hospitalId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        user: user.toJSON(),
        token,
        message: 'Login berhasil'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat login'
      };
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      await connectDB();

      const { name, email, password, role, hospitalId } = userData;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        email: email.toLowerCase() 
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Email sudah terdaftar'
        };
      }

      // Validate role permissions
      if (role === 'admin') {
        // Check if there's already an admin for this hospital
        const existingAdmin = await User.findOne({ 
          hospitalId, 
          role: 'admin',
          isActive: true 
        });

        if (existingAdmin) {
          return {
            success: false,
            message: 'Rumah sakit ini sudah memiliki administrator'
          };
        }
      }

      // Create new user
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
        hospitalId: hospitalId.trim(),
        isActive: true
      });

      await newUser.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: newUser._id,
          email: newUser.email,
          role: newUser.role,
          hospitalId: newUser.hospitalId
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        success: true,
        user: newUser.toJSON(),
        token,
        message: 'Registrasi berhasil'
      };

    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 11000) {
        return {
          success: false,
          message: 'Email sudah terdaftar'
        };
      }

      return {
        success: false,
        message: 'Terjadi kesalahan saat registrasi'
      };
    }
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: any; message?: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      await connectDB();
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return {
          valid: false,
          message: 'User tidak ditemukan atau tidak aktif'
        };
      }

      return {
        valid: true,
        user: user.toJSON()
      };

    } catch (error) {
      return {
        valid: false,
        message: 'Token tidak valid'
      };
    }
  }

  async getUsersByHospital(hospitalId: string): Promise<IUser[]> {
    try {
      await connectDB();
      
      const users = await User.find({ 
        hospitalId,
        isActive: true 
      }).select('-password').sort({ createdAt: -1 });

      return users;

    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, newRole: 'admin' | 'finance' | 'viewer', updatedBy: string): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan'
        };
      }

      // Check permissions
      const updater = await User.findById(updatedBy);
      if (!updater || updater.role !== 'admin') {
        return {
          success: false,
          message: 'Tidak memiliki izin untuk mengubah role'
        };
      }

      // Prevent admin from changing their own role
      if (userId === updatedBy && user.role === 'admin') {
        return {
          success: false,
          message: 'Admin tidak dapat mengubah role sendiri'
        };
      }

      user.role = newRole;
      await user.save();

      return {
        success: true,
        user: user.toJSON(),
        message: 'Role berhasil diubah'
      };

    } catch (error) {
      console.error('Update role error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat mengubah role'
      };
    }
  }

  async deactivateUser(userId: string, deactivatedBy: string): Promise<AuthResponse> {
    try {
      await connectDB();

      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User tidak ditemukan'
        };
      }

      // Check permissions
      const deactivator = await User.findById(deactivatedBy);
      if (!deactivator || deactivator.role !== 'admin') {
        return {
          success: false,
          message: 'Tidak memiliki izin untuk menonaktifkan user'
        };
      }

      // Prevent admin from deactivating themselves
      if (userId === deactivatedBy) {
        return {
          success: false,
          message: 'Admin tidak dapat menonaktifkan akun sendiri'
        };
      }

      user.isActive = false;
      await user.save();

      return {
        success: true,
        message: 'User berhasil dinonaktifkan'
      };

    } catch (error) {
      console.error('Deactivate user error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan saat menonaktifkan user'
      };
    }
  }
}

export default new AuthService();