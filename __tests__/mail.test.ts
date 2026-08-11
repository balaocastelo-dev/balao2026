import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBaseTemplate, getOrderStatusUpdateTemplate } from '@/lib/mail-templates';

// Mock process.env
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000';

describe('Mail Templates', () => {
    it('should generate base template with content', () => {
        const content = '<p>Hello World</p>';
        const html = getBaseTemplate(content, 'Test Title');
        expect(html).toContain('Hello World');
        expect(html).toContain('Test Title');
        expect(html).toContain('Balão Castelo');
    });

    it('should include unsubscribe link when email is provided', () => {
        const content = '<p>Hello</p>';
        const email = 'test@example.com';
        const html = getBaseTemplate(content, 'Title', email);
        expect(html).toContain('unsubscribe?email=test%40example.com');
    });

    it('should not include unsubscribe link when email is missing', () => {
        const content = '<p>Hello</p>';
        const html = getBaseTemplate(content, 'Title');
        expect(html).not.toContain('unsubscribe?email=');
    });

    it('should generate order status update template correctly', () => {
        const order = {
            id: '12345678-abcd',
            customer_name: 'John Doe',
            customer_email: 'john@example.com'
        };
        const html = getOrderStatusUpdateTemplate(order, 'shipped');
        
        expect(html).toContain('John'); // First name only
        expect(html).toContain('12345678');
        expect(html).toContain('🚚 Enviado');
        // Colors might be in style attribute
        expect(html).toContain('background: #f5f3ff'); 
    });
});
