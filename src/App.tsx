import { useEffect, useState } from 'react'
import './App.css'

type WeatherData = {
  temperature: number
  feelsLike: number
  weatherCode: number
  maxTemperature: number
  minTemperature: number
  precipitationProbability: number | null
}

type WeatherLocation = {
  name: string
  latitude: number
  longitude: number
}

const locations: WeatherLocation[] = [
  {
    name: '東京都板橋区舟渡',
    latitude: 35.79,
    longitude: 139.68,
  },
  {
    name: '埼玉県さいたま市南区',
    latitude: 35.85,
    longitude: 139.65,
  },
]

const trainLines = [
  {
    name: '埼京線',
    url: 'https://traininfo.jreast.co.jp/train_info/kanto.aspx#direction_tohoku',
  },
  {
    name: '京浜東北線',
    url: 'https://traininfo.jreast.co.jp/train_info/kanto.aspx#direction_tohoku',
  },
  {
    name: '武蔵野線',
    url: 'https://traininfo.jreast.co.jp/train_info/kanto.aspx#direction_tohoku',
  },
]

function getWeatherDescription(code: number) {
  if (code === 0) return { icon: '☀️', text: '快晴' }
  if (code === 1) return { icon: '🌤️', text: 'おおむね晴れ' }
  if (code === 2) return { icon: '⛅', text: '一部くもり' }
  if (code === 3) return { icon: '☁️', text: 'くもり' }
  if (code === 45 || code === 48) return { icon: '🌫️', text: '霧' }
  if (code >= 51 && code <= 67) return { icon: '🌧️', text: '雨' }
  if (code >= 71 && code <= 77) return { icon: '❄️', text: '雪' }
  if (code >= 80 && code <= 82) return { icon: '🌧️', text: 'にわか雨' }
  if (code >= 85 && code <= 86) return { icon: '🌨️', text: 'にわか雪' }
  if (code >= 95) return { icon: '⛈️', text: '雷雨' }

  return { icon: '🌥️', text: '天気情報' }
}

async function fetchWeather(
  location: WeatherLocation,
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,weather_code',
    daily:
      'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'Asia/Tokyo',
    forecast_days: '1',
  })

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
  )

  if (!response.ok) {
    throw new Error('天気情報を取得できませんでした')
  }

  const data = await response.json()

  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    weatherCode: data.current.weather_code,
    maxTemperature: data.daily.temperature_2m_max[0],
    minTemperature: data.daily.temperature_2m_min[0],
    precipitationProbability:
      data.daily.precipitation_probability_max?.[0] ?? null,
  }
}

function App() {
  const [weather, setWeather] = useState<
    Record<string, WeatherData | null>
  >({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState('')

  async function loadWeather() {
    setLoading(true)
    setErrors({})

    const results = await Promise.all(
      locations.map(async (location) => {
        try {
          const result = await fetchWeather(location)
          return {
            name: location.name,
            data: result,
            error: false,
          }
        } catch {
          return {
            name: location.name,
            data: null,
            error: true,
          }
        }
      }),
    )

    const nextWeather: Record<string, WeatherData | null> = {}
    const nextErrors: Record<string, boolean> = {}

    results.forEach((result) => {
      nextWeather[result.name] = result.data
      nextErrors[result.name] = result.error
    })

    setWeather(nextWeather)
    setErrors(nextErrors)
    setUpdatedAt(
      new Date().toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    )
    setLoading(false)
  }

  useEffect(() => {
    void loadWeather()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <p className="subtitle">GOOD MORNING</p>
        <h1>朝の情報チェック</h1>
        <p className="description">
          今日のお出かけ情報をまとめて確認
        </p>

        <div className="refresh-area">
          <span className="update-time">
            {updatedAt ? `天気の更新：${updatedAt}` : '天気を取得中…'}
          </span>
          <button
            className="refresh-button"
            onClick={() => void loadWeather()}
            disabled={loading}
          >
            {loading ? '取得中…' : '天気を更新'}
          </button>
        </div>
      </header>

      <main className="dashboard">
        {locations.map((location) => {
          const data = weather[location.name]
          const description = data
            ? getWeatherDescription(data.weatherCode)
            : null

          return (
            <section className="card weather-card" key={location.name}>
              <div className="card-heading">
                <span className="icon">🌤️</span>
                <h2>今日の天気</h2>
              </div>

              {loading && !data ? (
                <p className="status">天気を取得しています…</p>
              ) : errors[location.name] ? (
                <p className="error-message">
                  天気を取得できませんでした。
                  <br />
                  通信状況を確認して更新してください。
                </p>
              ) : data && description ? (
                <>
                  <div className="weather-description">
                    <div className="location-label">{location.name}</div>
                    <div className="weather-condition">
                      <span className="weather-emoji">{description.icon}</span>
                      <span>{description.text}</span>
                    </div>
                  </div>

                  <p className="temperature">
                    {data.temperature}°
                    <span>C</span>
                  </p>

                  <p className="detail">
                    体感温度：{data.feelsLike}°C
                  </p>

                  <div className="weather-details">
                    <div>
                      <span>最高</span>
                      <strong>{data.maxTemperature}°C</strong>
                    </div>
                    <div>
                      <span>最低</span>
                      <strong>{data.minTemperature}°C</strong>
                    </div>
                    <div>
                      <span>降水確率</span>
                      <strong>
                        {data.precipitationProbability === null
                          ? 'データなし'
                          : `${data.precipitationProbability}%`}
                      </strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="status">天気情報はまだありません。</p>
              )}
            </section>
          )
        })}

        <section className="card train-card">
          <div className="card-heading">
            <span className="icon">🚃</span>
            <h2>JRの運行情報</h2>
          </div>

          <p className="detail train-intro">
            各路線の公式ページで最新の運行情報を確認できます。
          </p>

          <div className="train-list">
            {trainLines.map((line) => (
              <a
                className="train-link"
                href={line.url}
                target="_blank"
                rel="noreferrer"
                key={line.name}
              >
                <span>{line.name}</span>
                <span className="link-arrow">公式情報を見る ↗</span>
              </a>
            ))}
          </div>

          <p className="train-note">
            ※この画面では、JRの運行状況そのものはまだ自動取得していません。
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>自分専用の朝の情報ダッシュボード</p>
        <p>天気情報：Open-Meteo</p>
      </footer>
    </div>
  )
}

export default App