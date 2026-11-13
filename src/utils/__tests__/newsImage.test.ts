import { getNewsImage } from '../newsImage'

describe('news image sources', () => {
  test.each([undefined, '', 'broken', '//other.test/image', '/\\other.test/image', 'https://via.placeholder.com/image', 'https://other.test/image', 'http://techkwiz.com/image'])('uses a local fallback for %s', source => {
    expect(getNewsImage(source)).toBe('/images/news-fallback.svg')
  })
  test('keeps configured HTTPS media and the local fallback', () => {
    expect(getNewsImage('https://techkwiz.com/wp-content/uploads/image.jpg')).toBe('https://techkwiz.com/wp-content/uploads/image.jpg')
    expect(getNewsImage('/images/article.jpg')).toBe('/images/article.jpg')
    expect(getNewsImage('/images/news-fallback.svg')).toBe('/images/news-fallback.svg')
  })
})
