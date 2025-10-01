import React, { useState, FormEvent } from "react";

export interface CompraFormData {
  nome: string;
  email: string;
  matricula: string;
  quantidade: number;
}

export interface CompraFormProps {
  onSubmit: (data: CompraFormData) => void;
  loading?: boolean;
}

export interface FormErrors {
  nome?: string;
  email?: string;
  matricula?: string;
  quantidade?: string;
}

const CompraForm: React.FC<CompraFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CompraFormData>({
    nome: "",
    email: "",
    matricula: "",
    quantidade: 1,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validação do nome
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    // Validação do email
    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "E-mail deve ter formato válido";
    }

    // Validação da matrícula
    if (!formData.matricula.trim()) {
      newErrors.matricula = "Matrícula é obrigatória";
    }

    // Validação da quantidade
    if (formData.quantidade < 1) {
      newErrors.quantidade = "Quantidade deve ser maior que zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (
    field: keyof CompraFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid='compra-form'>
      <div className='form-group'>
        <label htmlFor='nome'>Nome *</label>
        <input
          id='nome'
          type='text'
          value={formData.nome}
          onChange={(e) => handleInputChange("nome", e.target.value)}
          placeholder='Digite seu nome completo'
          data-testid='input-nome'
          disabled={loading}
        />
        {errors.nome && (
          <span className='error-message' data-testid='error-nome'>
            {errors.nome}
          </span>
        )}
      </div>

      <div className='form-group'>
        <label htmlFor='email'>E-mail *</label>
        <input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder='Digite seu e-mail'
          data-testid='input-email'
          disabled={loading}
        />
        {errors.email && (
          <span className='error-message' data-testid='error-email'>
            {errors.email}
          </span>
        )}
      </div>

      <div className='form-group'>
        <label htmlFor='matricula'>Matrícula *</label>
        <input
          id='matricula'
          type='text'
          value={formData.matricula}
          onChange={(e) => handleInputChange("matricula", e.target.value)}
          placeholder='Digite sua matrícula'
          data-testid='input-matricula'
          disabled={loading}
        />
        {errors.matricula && (
          <span className='error-message' data-testid='error-matricula'>
            {errors.matricula}
          </span>
        )}
      </div>

      <div className='form-group'>
        <label htmlFor='quantidade'>Quantidade</label>
        <input
          id='quantidade'
          type='number'
          min='1'
          value={formData.quantidade}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            handleInputChange("quantidade", isNaN(value) ? 1 : value);
          }}
          data-testid='input-quantidade'
          disabled={loading}
        />
        {errors.quantidade && (
          <span className='error-message' data-testid='error-quantidade'>
            {errors.quantidade}
          </span>
        )}
      </div>

      <button type='submit' disabled={loading} data-testid='submit-button'>
        {loading ? "Processando..." : "Finalizar Compra"}
      </button>
    </form>
  );
};

export default CompraForm;
