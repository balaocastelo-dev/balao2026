/**
 * Configurações globais do site.
 * Para dados completos da empresa (endereço, horários, CNPJ etc.)
 * importe BUSINESS_INFO de @/lib/business-info.
 */
import { BUSINESS_INFO } from "@/lib/business-info";

export const SITE_CONFIG = {
  name: "Balão da Informática Castelo",
  companyName: "Balão da Informática Castelo",
  cnpj: BUSINESS_INFO.cnpj,
  phone: {
    display: BUSINESS_INFO.phone.display,
    number: BUSINESS_INFO.phone.number,
  },
  email: BUSINESS_INFO.email,
  address: BUSINESS_INFO.address,
  postalCode: BUSINESS_INFO.postalCode,
  whatsapp: {
    number: BUSINESS_INFO.whatsapp.number,
    display: BUSINESS_INFO.whatsapp.display,
    href: BUSINESS_INFO.whatsapp.href,
    messageDefault: BUSINESS_INFO.whatsapp.defaultMessage,
  },
  social: BUSINESS_INFO.social,
  pix: {
    key: "34397947000108", // CNPJ sem pontuação
    name: "Balao da Informatica Castelo",
    city: "CAMPINAS",
    cnpj: "34397947000108",
  },
};
