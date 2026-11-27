export const SITE_CONFIG = {
  name: "Balão da Informática",
  companyName: "Balão da Informática Anchieta",
  cnpj: "34.397.947/0001-08",
  phone: {
    display: "(19) 3255-1661",
    number: "551932551661"
  },
  email: "balaocastelo@balaodainformatica.com.br",
  address: "Av. Anchieta, 789 - Cambuí, Campinas - SP",
  addressShort: "Av. Anchieta, 789 - Cambuí",
  city: "Campinas",
  region: "SP",
  postalCode: "13015-101",
  openingHoursDisplay: "Seg. a qui. 8h–18h | Sex. 8h–17h | Sáb. 8h–13h | Dom. fechado",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Bal%C3%A3o%20da%20Inform%C3%A1tica%20Anchieta%20Av.%20Anchieta%20789%20Campinas%20SP",
  whatsapp: {
    number: "5519987510267",
    display: "(19) 98751-0267",
    messageDefault: "Olá! Vim pelo site e quero atendimento da Balão da Informática em Campinas.",
  },
  social: {
    instagram: "https://www.instagram.com/balaoanchieta/",
    facebook: "https://facebook.com/balaodainformatica",
  },
  pix: {
    key: "34397947000108", // CNPJ
    name: "Balao da informatica anchieta",
    city: "CAMPINAS",
    cnpj: "34397947000108"
  }
};

/** Horário confirmado: seg–qui 8h–18h, sexta 8h–17h, sábado 8h–13h, domingo fechado. */
export const HORARIO_SCHEMA = [
  {
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "08:00",
    closes: "18:00",
  },
  {
    dayOfWeek: ["Friday"],
    opens: "08:00",
    closes: "17:00",
  },
  {
    dayOfWeek: ["Saturday"],
    opens: "08:00",
    closes: "13:00",
  },
] as const;
