import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components'

interface QuoteGeneratedEmailProps {
  userName?: string
  shopName: string
  recipientAddress: string
  quotes: Array<{
    provider: string
    service: string
    amount: number
    currency: string
  }>
  bestQuote?: {
    provider: string
    service: string
    amount: number
  }
  createdAt: string
}

export default function QuoteGeneratedEmail({
  userName,
  shopName,
  recipientAddress,
  quotes,
  bestQuote,
  createdAt,
}: QuoteGeneratedEmailProps) {
  const previewText = `Báo giá mới cho ${shopName}: ${quotes.length} nhà vận chuyển`
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📦 Báo giá mới</Heading>
          
          <Text style={text}>
            Xin chào {userName},
          </Text>
          
          <Text style={text}>
            Bạn vừa tạo một báo giá mới cho shop <strong>{shopName}</strong>.
          </Text>
          
          <Section style={infoSection}>
            <Text style={label}>📍 Địa chỉ giao hàng:</Text>
            <Text style={value}>{recipientAddress}</Text>
            
            <Text style={label}>📅 Thời gian:</Text>
            <Text style={value}>{new Date(createdAt).toLocaleString('vi-VN')}</Text>
          </Section>
          
          <Hr style={hr} />
          
          <Heading style={h2}>💰 Kết quả báo giá ({quotes.length} nhà vận chuyển)</Heading>
          
          {bestQuote && (
            <Section style={bestQuoteSection}>
              <Text style={bestQuoteLabel}>⭐ Giá tốt nhất</Text>
              <Text style={bestQuoteProvider}>{bestQuote.provider} - {bestQuote.service}</Text>
              <Text style={bestQuoteAmount}>{formatCurrency(bestQuote.amount)}</Text>
            </Section>
          )}
          
          <Section style={quotesSection}>
            {quotes.map((quote, index) => (
              <div key={index} style={quoteItem}>
                <Text style={quoteProvider}>
                  {quote.provider} - {quote.service}
                </Text>
                <Text style={quoteAmount}>
                  {formatCurrency(quote.amount)}
                </Text>
              </div>
            ))}
          </Section>
          
          <Section style={buttonSection}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/history`}>
              Xem chi tiết
            </Link>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            💡 <strong>Mẹo:</strong> Bạn có thể tắt thông báo này trong phần cài đặt tài khoản.
          </Text>
          
          <Text style={footer}>
            Trân trọng,<br />
            Đội ngũ Addressify
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 24px',
  padding: '0 40px',
}

const h2 = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px',
  padding: '0 40px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  margin: '16px 0',
}

const infoSection = {
  padding: '16px 40px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  margin: '24px 40px',
}

const label = {
  color: '#666',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '8px 0 4px',
}

const value = {
  color: '#333',
  fontSize: '15px',
  margin: '0 0 16px',
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 40px',
}

const bestQuoteSection = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #10b981',
  borderRadius: '8px',
  padding: '20px',
  margin: '16px 40px',
  textAlign: 'center' as const,
}

const bestQuoteLabel = {
  color: '#059669',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const bestQuoteProvider = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const bestQuoteAmount = {
  color: '#10b981',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
}

const quotesSection = {
  padding: '0 40px',
}

const quoteItem = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
  borderRadius: '6px',
  margin: '8px 0',
}

const quoteProvider = {
  color: '#333',
  fontSize: '15px',
  fontWeight: '500',
  margin: 0,
}

const quoteAmount = {
  color: '#6366f1',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0,
}

const buttonSection = {
  padding: '24px 0',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '8px 40px',
  margin: '16px 0',
}
