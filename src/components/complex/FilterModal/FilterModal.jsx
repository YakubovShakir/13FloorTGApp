import React, { useState } from "react"
import Assets from "../../../assets"

const FilterButton = ({
  title,
  filteredField,
  filteredValue,
  addComplexFilter,
  removeComplexFilter,
  currentComplexFilters
}) => {
  const [isActive, setIsActive] = useState(Boolean(currentComplexFilters.find(item => item.filteredField === filteredField && item.filteredValue === filteredValue)))

  const handleClick = () => {
    setIsActive(!isActive)
    if (!isActive) {
      return addComplexFilter({ filteredField, filteredValue })
    }

    return removeComplexFilter({ filteredField, filteredValue })
  }

  return (
    <div
      style={{
        height: 33,
        width: 69,
        background: isActive
          ? "linear-gradient(to right, #E94E1B, #F37500)"
          : "#50484A",
        borderRadius: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 2,
        fontSize: 12,
        color: "white",
        margin: 2,
        fontWeight: "200",
      }}
      onClick={handleClick}
    >
      <p style={{ fontFamily: "Roboto", textAlign: "center" }}>{title}</p>
    </div>
  )
}

const Categories = [
  {
    title: "Кежуал",
    filteredField: "tag",
    filteredValue: "Casual",
  },
  {
    title: "Спорт",
    filteredField: "tag",
    filteredValue: "Sport",
  },
  {
    title: "Офис",
    filteredField: "tag",
    filteredValue: "Office",
  },
  {
    title: "События",
    filteredField: "tag",
    filteredValue: "Event",
  },
]

const Tiers = [
  {
    title: "0",
    filteredField: "tier",
    filteredValue: 0,
  },
  {
    title: "1",
    filteredField: "tier",
    filteredValue: 1,
  },
  {
    title: "2",
    filteredField: "tier",
    filteredValue: 2,
  },
  {
    title: "3",
    filteredField: "tier",
    filteredValue: 3,
  },
  {
    title: "4",
    filteredField: "tier",
    filteredValue: 4,
  },
  {
    title: "5",
    filteredField: "tier",
    filteredValue: 5,
  },
]

export default ({
  baseStyles,
  isOpen,
  addComplexFilter,
  removeComplexFilter,
  setIsFilterModalOpen,
  currentComplexFilters
}) => {
  return (
    <div
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          position: "absolute",
          background: `url(${Assets.BG.filterModalBG})`,
          zIndex: 6,
          height: 281,
          width: 320,
          borderRadius: 6,
          backgroundSize: "cover",
        }}
      >
        <div onClick={() => setIsFilterModalOpen(false)}>
          <img
            src={Assets.Icons.modalClose}
            width={16}
            height={16}
            style={{ position: "absolute", right: 15, top: 15 }}
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 281,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <p
              style={{
                fontFamily: "Roboto",
                fontWeight: "500",
                color: "white",
                textAlign: "center",
                marginBottom: 14,
                fontSize: 16,
              }}
            >
              Категория
            </p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {Categories.map((category) => (
                <FilterButton
                  title={category.title}
                  filteredField={category.filteredField}
                  filteredValue={category.filteredValue}
                  addComplexFilter={() =>
                    addComplexFilter({
                      filteredField: category.filteredField,
                      filteredValue: category.filteredValue,
                    })
                  }
                  removeComplexFilter={() => {
                    removeComplexFilter(
                        {
                            filteredField: category.filteredField,
                            filteredValue: category.filteredValue,
                        }
                    )
                  }}
                  currentComplexFilters={currentComplexFilters}
                />
              ))}
            </div>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", marginTop: 14 }}
          >
            <p
              style={{
                fontFamily: "Roboto",
                fontWeight: "500",
                color: "white",
                textAlign: "center",
                marginBottom: 14,
                fontSize: 15,
              }}
            >
              Тир Одежды
            </p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {Tiers.slice(0, 4).map((tier) => (
                <FilterButton
                  title={tier.title}
                  filteredField={tier.filteredField}
                  filteredValue={tier.filteredValue}
                  addComplexFilter={() =>
                    addComplexFilter({
                      filteredField: tier.filteredField,
                      filteredValue: tier.filteredValue,
                    })
                  }
                  removeComplexFilter={() => {
                    removeComplexFilter(
                        {
                            filteredField: tier.filteredField,
                      filteredValue: tier.filteredValue,
                        }
                    )
                  }}
                  currentComplexFilters={currentComplexFilters}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              {Tiers.slice(4).map((tier) => (
                <FilterButton
                  title={tier.title}
                  filteredField={tier.filteredField}
                  filteredValue={tier.filteredValue}
                  addComplexFilter={() =>
                    addComplexFilter({
                      filteredField: tier.filteredField,
                      filteredValue: tier.filteredValue,
                    })
                  }
                  removeComplexFilter={() => {
                    removeComplexFilter(
                        {
                            filteredField: tier.filteredField,
                      filteredValue: tier.filteredValue,
                        }
                    )
                  }}
                  currentComplexFilters={currentComplexFilters}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
