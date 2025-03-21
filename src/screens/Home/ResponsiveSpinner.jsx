import { motion } from 'framer-motion'

const ResponsiveSpinner = ({ color = "#f37500", size = 70 }) => {
  const backgroundFrames = Array.from({ length: 60 }, (_, i) => {
    const opacity = (i + 1) / 60
    return `#000000, ${opacity})`
  })

  return (
    <motion.div
      initial={{ opacity: 0, backgroundColor: "transparent" }}
      animate={{ opacity: 1, backgroundColor: backgroundFrames }}
      transition={{ duration: 1, ease: "easeInOut" }}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          rotate: 360,
          scale: [0.7, 1, 0.7],
          opacity: 1,
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
        style={{
          width: size,
          height: size,
          border: `5px solid ${color}`,
          borderTop: `5px solid transparent`,
          borderRadius: "50%",
        }}
      />
    </motion.div>
  )
}

export default ResponsiveSpinner
