import { useEffect, useState, useRef } from 'react'
import { tweetService } from '@/services/api'
import { Icon } from '@iconify/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Tweet {
  mediaUrl: string
  mediaId: string
  content: string
}

const AudioFolder = () => {
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [visibleTweets, setVisibleTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const folderSoundRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    folderSoundRef.current = new Audio('/sounds/folder.wav')
    folderSoundRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const data = await tweetService.getTweets()
        const audioTweets = data.filter((tweet: Tweet) => tweet.mediaUrl).slice(0, 20)
        setTweets(audioTweets)
        setVisibleTweets([])
      } catch (error) {
        setError('Failed to fetch tweets')
      } finally {
        setLoading(false)
      }
    }

    fetchTweets()
  }, [])

  useEffect(() => {
    if (tweets.length > 0 && visibleTweets.length < tweets.length) {
      const timer = setTimeout(() => {
        setVisibleTweets((prev) => [...prev, tweets[visibleTweets.length]])
      }, Math.random() * 100 + 50) // Random delay between 50-150ms

      return () => clearTimeout(timer)
    }
  }, [tweets, visibleTweets])

  const handleAudioClick = (mediaUrl: string) => {
    if (folderSoundRef.current) {
      const sound = folderSoundRef.current.cloneNode() as HTMLAudioElement
      sound.play().catch((e) => console.log('Audio play failed:', e))
    }

    if (playingAudio === mediaUrl) {
      audioElement?.pause()
      setPlayingAudio(null)
      setAudioElement(null)
    } else {
      audioElement?.pause()
      const audio = new Audio(mediaUrl)
      audio.play()
      audio.onended = () => {
        setPlayingAudio(null)
        setAudioElement(null)
      }
      setPlayingAudio(mediaUrl)
      setAudioElement(audio)
    }
  }

  if (loading) return <div className="text-[#1E755C]">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-1 pb-1">
      <AnimatePresence>
        {visibleTweets.map((tweet, index) => (
          <motion.div
            key={tweet.mediaId}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: index * 0.1 // Delay increases for each folder
            }}
            onClick={() => handleAudioClick(tweet.mediaUrl)}
            className="flex w-20 h-20 flex-col items-center gap-1 text-primary-light hover:bg-primary-light/40 p-1 cursor-pointer rounded"
          >
            <Icon
              icon={playingAudio === tweet.mediaUrl ? 'ri:folder-music-fill' : 'ri:folder-fill'}
              className="w-14 h-14"
              style={{
                color: playingAudio === tweet.mediaUrl ? '#1E755C' : 'var(--primary-light)'
              }}
            />
            <span className="text-xs text-center truncate w-full">Audio_{tweet.mediaId}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default AudioFolder
