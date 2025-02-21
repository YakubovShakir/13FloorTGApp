import WebApp from "@twa-dev/sdk"
import { instance } from "../services/instance"

export const handleStarsPayment = async (userId, productType, productId) => {
    const response = await instance.post('/users/request-stars-invoice-link', {
        id: productId,
        productType,
        userId,
    })
    await new Promise((resolve) => {
      WebApp.openInvoice(response.data.invoiceLink, (status) => {
        // Можно вызвать попап или анимацию успеха/фейла
        if(status === "paid") {
            return resolve()
        }
        if(status === "cancelled") {}
        if(status === 'pending') {}
        if(status === 'failed') {}
      })
    })
}