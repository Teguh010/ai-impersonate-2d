const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_API_KEY

export const tweetService = {
  async getTweets() {
    const response = await fetch(`${API_BASE_URL}/tweets`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch tweets')
    }

    return await response.json()
  }
}
