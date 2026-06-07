"use client";

import React, { useState } from "react";
import { User, MapPin, Phone, Mail, AlertCircle } from "lucide-react";
import { usePdv } from "../store";
import SellerSelector from "./SellerSelector";

export default function CustomerForm() {
  const { state, dispatch } = usePdv();
  const [loadingCep, setLoadingCep] = useState(false);

  const handleChange = (field: string, value: string) => {
    dispatch({
      type: "SET_CUSTOMER",
      payload: { ...state.customer, [field]: value }
    });
  };

  const handleCepBlur = async () => {
    const cep = state.customer.cep.replace(/\D/g, "");
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        dispatch({
          type: "SET_CUSTOMER",
          payload: {
            ...state.customer,
            address: data.logradouro,
            cep: data.cep,
            city: data.localidade,
            state: data.uf,
            number: "",
            complement: ""
          }
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleQuickClient = () => {
    dispatch({
      type: "SET_CUSTOMER",
      payload: {
        ...state.customer,
        name: "Cliente Final",
        cpf_cnpj: "000.000.000-00",
        phone: "19999999999",
        email: "",
        cep: "",
        address: "",
        number: "",
        complement: "",
        city: "",
        state: ""
      }
    });
    // Avança para a próxima etapa (pagamento)
    dispatch({ type: "SET_STEP", payload: "payment" });
  };

  return (
    <div className="flex min-h-[60vh] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:h-full md:rounded-lg">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <User className="text-red-600" />
          Dados do Cliente
        </h2>
        <button
          onClick={handleQuickClient}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 font-medium transition-colors"
        >
          Cliente Rápido (Balcão)
        </button>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pr-1 md:pr-2">
        {/* Nome / Razão Social */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo / Razão Social *</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={state.customer.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="Nome do cliente"
            />
          </div>
        </div>

        {/* CPF / CNPJ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CPF / CNPJ *</label>
          <input
            type="text"
            value={state.customer.cpf_cnpj}
            onChange={(e) => handleChange("cpf_cnpj", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="000.000.000-00"
          />
        </div>

        {/* Contato */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={state.customer.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={state.customer.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="cliente@email.com"
              />
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
          <div className="relative">
            <input
              type="text"
              value={state.customer.cep}
              onChange={(e) => handleChange("cep", e.target.value)}
              onBlur={handleCepBlur}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="00000-000"
            />
            {loadingCep && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full"></div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={state.customer.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full pl-9 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Rua, Avenida, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
            <input
              type="text"
              value={state.customer.number}
              onChange={(e) => handleChange("number", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Nº"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
            <input
              type="text"
              value={state.customer.complement}
              onChange={(e) => handleChange("complement", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Apto, Bloco, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade/UF</label>
            <div className="grid grid-cols-[1fr_84px] gap-2">
              <input
                type="text"
                value={state.customer.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Cidade"
              />
              <input
                type="text"
                value={state.customer.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="UF"
                maxLength={2}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Seleção de Vendedor */}
      <div className="mt-6">
        <SellerSelector
          onSellerSelect={(sellerId) => dispatch({ type: "SET_SELLER", payload: sellerId })}
          selectedSeller={state.sellerId}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
        <p>Preencha os dados corretamente para emissão de Nota Fiscal. O CPF/CNPJ é obrigatório.</p>
      </div>

      {/* Botões de navegação */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: "cart" })}
          className="flex-1 rounded-xl bg-gray-500 px-4 py-3 font-bold text-white transition-colors hover:bg-gray-600 md:rounded"
        >
          Voltar ao Carrinho
        </button>
        <button
          onClick={() => dispatch({ type: "SET_STEP", payload: "payment" })}
          disabled={!state.customer.name || !state.customer.cpf_cnpj}
          className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 md:rounded"
        >
          Ir para Pagamento
        </button>
      </div>
    </div>
  );
}
