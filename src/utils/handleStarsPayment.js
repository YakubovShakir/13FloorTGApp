import WebApp from "@twa-dev/sdk"
import { instance } from "../services/instance"

export const handleStarsPayment = async (userId, productType, productId, lang, durationHours = 0) => {
    const response = await instance.post('/users/request-stars-invoice-link', {
        id: productId,
        productType,
        userId,
        lang,
        durationHours
    })
    await new Promise((resolve) => {
      WebApp.openInvoice(response.data.invoiceLink, (status) => {
        return resolve()
      })
    })
}