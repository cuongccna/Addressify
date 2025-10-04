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
} from '@react-email/components'

interface WelcomeEmailProps {
  name?: string
  email: string
}

export default function WelcomeEmail({ name, email }: WelcomeEmailProps) {
  const previewText = `Chào mừng bạn đến với Addressify!`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Chào mừng đến với Addressify!</Heading>
          
          <Text style={text}>
            Xin chào {name || email},
          </Text>
          
          <Text style={text}>
            Cảm ơn bạn đã đăng ký sử dụng Addressify - nền tảng chuẩn hóa địa chỉ và so sánh giá ship cho chủ shop.
          </Text>
          
          <Section style={section}>
            <Text style={boldText}>✨ Những gì bạn có thể làm:</Text>
            <Text style={listText}>📍 Chuẩn hóa địa chỉ Việt Nam tự động</Text>
            <Text style={listText}>💰 So sánh giá ship từ GHN, GHTK, VTP</Text>
            <Text style={listText}>🏪 Quản lý nhiều shop trong một tài khoản</Text>
            <Text style={listText}>📊 Xem lịch sử báo giá và thống kê</Text>
            <Text style={listText}>📦 Xử lý hàng loạt nhiều địa chỉ cùng lúc</Text>
          </Section>
          
          <Section style={buttonSection}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/normalize`}>
              Bắt đầu ngay
            </Link>
          </Section>
          
          <Text style={text}>
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng trả lời email này hoặc truy cập trang hỗ trợ của chúng tôi.
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
  margin: '40px 0',
  padding: '0 40px',
  textAlign: 'center' as const,
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
}

const boldText = {
  color: '#333',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '10px',
}

const listText = {
  color: '#555',
  fontSize: '15px',
  lineHeight: '24px',
  padding: '4px 40px 4px 60px',
  margin: 0,
}

const section = {
  padding: '24px 0',
}

const buttonSection = {
  padding: '27px 0',
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
  padding: '24px 40px 0',
}
