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

interface WeeklySummaryEmailProps {
  userName?: string
  weekStart: string
  weekEnd: string
  stats: {
    totalQuotes: number
    totalShops: number
    totalSavings: number
    avgAmount: number
    topProvider: {
      name: string
      count: number
    }
    topShop: {
      name: string
      count: number
    }
  }
}

export default function WeeklySummaryEmail({
  userName,
  weekStart,
  weekEnd,
  stats,
}: WeeklySummaryEmailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }
  
  const previewText = `Báo cáo tuần: ${stats.totalQuotes} báo giá, tiết kiệm ${formatCurrency(stats.totalSavings)}`

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>📊 Báo cáo tuần của bạn</Heading>
          
          <Text style={text}>
            Xin chào {userName},
          </Text>
          
          <Text style={text}>
            Đây là tổng kết hoạt động của bạn từ ngày {formatDate(weekStart)} đến {formatDate(weekEnd)}.
          </Text>
          
          <Section style={statsGrid}>
            <div style={statCard}>
              <Text style={statLabel}>📦 Tổng báo giá</Text>
              <Text style={statValue}>{stats.totalQuotes}</Text>
            </div>
            
            <div style={statCard}>
              <Text style={statLabel}>🏪 Số shop</Text>
              <Text style={statValue}>{stats.totalShops}</Text>
            </div>
            
            <div style={statCard}>
              <Text style={statLabel}>💰 Tiết kiệm</Text>
              <Text style={statValue}>{formatCurrency(stats.totalSavings)}</Text>
            </div>
            
            <div style={statCard}>
              <Text style={statLabel}>📊 Giá TB</Text>
              <Text style={statValue}>{formatCurrency(stats.avgAmount)}</Text>
            </div>
          </Section>
          
          <Hr style={hr} />
          
          <Heading style={h2}>🏆 Top hoạt động</Heading>
          
          <Section style={topSection}>
            <Text style={topLabel}>Nhà vận chuyển được chọn nhiều nhất:</Text>
            <Text style={topValue}>
              <strong>{stats.topProvider.name}</strong> - {stats.topProvider.count} lần
            </Text>
            
            <Text style={topLabel}>Shop tạo báo giá nhiều nhất:</Text>
            <Text style={topValue}>
              <strong>{stats.topShop.name}</strong> - {stats.topShop.count} báo giá
            </Text>
          </Section>
          
          <Section style={buttonSection}>
            <Link style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/history`}>
              Xem chi tiết
            </Link>
          </Section>
          
          <Hr style={hr} />
          
          <Text style={footer}>
            💡 <strong>Mẹo tuần này:</strong> Sử dụng tính năng xuất Excel để phân tích chi tiết hơn về chi phí vận chuyển!
          </Text>
          
          <Text style={footer}>
            Hẹn gặp lại bạn vào tuần sau! 👋<br />
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
  textAlign: 'center' as const,
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

const statsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  padding: '24px 40px',
}

const statCard = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
}

const statLabel = {
  color: '#666',
  fontSize: '14px',
  margin: '0 0 8px',
}

const statValue = {
  color: '#6366f1',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: 0,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 40px',
}

const topSection = {
  padding: '16px 40px',
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  margin: '16px 40px',
}

const topLabel = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 4px',
}

const topValue = {
  color: '#451a03',
  fontSize: '16px',
  margin: '0 0 8px',
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
