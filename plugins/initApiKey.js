import 'virtual:svg-icons-register'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('app:created', async () => {
        const apiKey = useApiKey()
        apiKey.value = getStoredApiKey()
    })
})