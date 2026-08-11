
class Pix {
  private key: string;
  private name: string;
  private city: string;
  private amount: string;
  private txid: string;

  constructor(key: string, name: string, city: string, amount: number, txid: string = '***') {
    this.key = key; // Allow valid Pix key chars
    this.name = this.normalize(name).substring(0, 25).toUpperCase();
    this.city = this.normalize(city).substring(0, 15).toUpperCase();
    this.amount = amount.toFixed(2);
    this.txid = txid.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25).toUpperCase() || '***';
  }

  private normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  private formatField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  public getPayload(): string {
    // 00 - Payload Format Indicator
    const pfi = this.formatField('00', '01');

    // 26 - Merchant Account Information
    const gui = this.formatField('00', 'br.gov.bcb.pix');
    const key = this.formatField('01', this.key);
    const merchantAccount = this.formatField('26', gui + key);

    // 52 - Merchant Category Code
    const mcc = this.formatField('52', '0000');

    // 53 - Transaction Currency
    const currency = this.formatField('53', '986');

    // 54 - Transaction Amount
    const amount = this.formatField('54', this.amount);

    // 58 - Country Code
    const country = this.formatField('58', 'BR');

    // 59 - Merchant Name
    const name = this.formatField('59', this.name);

    // 60 - Merchant City
    const city = this.formatField('60', this.city);

    // 62 - Additional Data Field Template
    const txid = this.formatField('05', this.txid);
    const additionalData = this.formatField('62', txid);

    // 63 - CRC16
    const payload = pfi + merchantAccount + mcc + currency + amount + country + name + city + additionalData + '6304';
    const crc = this.crc16(payload);

    return payload + crc;
  }

  private crc16(payload: string): string {
    let crc = 0xFFFF;
    const polynomial = 0x1021;

    for (let i = 0; i < payload.length; i++) {
      crc ^= (payload.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ polynomial) & 0xFFFF;
        } else {
          crc = (crc << 1) & 0xFFFF;
        }
      }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0');
  }
}

export function generatePixPayload({
  key,
  name,
  city,
  amount,
  txid = '***'
}: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}) {
  const pix = new Pix(key, name, city, amount, txid);
  return pix.getPayload();
}
