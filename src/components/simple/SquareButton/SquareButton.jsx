import React from "react";
import { motion } from "framer-motion";
import Assets from "../../../assets";

export const SquareButton = ({
    handlePress,
    assignedValue,
    selectedValue,
    imageSrc,
    size = 60,
    imageSize = 40,
  }) => {
    const isSelected =
      assignedValue && selectedValue && assignedValue === selectedValue;
  
    return (
      <motion.div
        className="button-wrapper" // Основной контейнер кнопки
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        style={{
          backgroundColor: isSelected ? "#E94E1B" : "rgb(57, 57, 57)",
          height: size + 5,
          width: size,
          borderRadius: 8,
          position: "relative", // Чтобы корректно отображать слои
        }}
        onClick={handlePress}
      >
        {/* Тень кнопки */}
        {isSelected && (
          <motion.div
            className="button-shadow" // Контейнер тени
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <img
              src={Assets.Layers.squareButtonShadow}
              width={36}
              height={36}
              style={{
                position: "absolute",
                bottom: 0,
                left: -1,
                zIndex: 5,
                borderBottomLeftRadius: 14,
                borderBottomRightRadius: 14,
                
              }}
            />
          </motion.div>
        )}
  
        <motion.div
          className="button-body" // Внутренний блок кнопки
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
            backgroundColor: "rgb(18, 18, 18)",
            border: "1px solid rgb(57, 57, 57)",
          }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            height: size + 2,
            width: size + 2,
            marginLeft: -2,
            marginTop: -2,
            borderRadius: 8,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <motion.img
            className="button-icon" // Иконка внутри кнопки
            src={imageSrc}
            width={imageSize}
            height={imageSize}
            animate={{
              padding: "5px",
              opacity: 1,
              rotate: 0,
              scale: isSelected ? 0.9 : 1,
              filter: isSelected ? "brightness(0.8)" : "brightness(1)",
            }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            style={{
              position: "relative",
              zIndex: 3,
            }}
          />
        </motion.div>
      </motion.div>
    );
  };
  