import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data: any) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Registrarse</h2>
        {errorMsg && <div className="p-3 text-sm text-red-500 bg-red-100 rounded">{errorMsg}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
            <input
              type="text"
              {...register('name', { required: 'El nombre es requerido' })}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
            <input
              type="email"
              {...register('email', { required: 'El correo es requerido' })}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message as string}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <input
              type="password"
              {...register('password', { required: 'La contraseña es requerida', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
              className="w-full px-3 py-2 mt-1 border rounded shadow-sm focus:ring-primary focus:border-primary bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message as string}</p>}
          </div>
          <button
            type="submit"
            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Registrar
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-primary hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
