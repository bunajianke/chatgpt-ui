import dayjs from "dayjs"

export const generateDayList = () => {
  return {
    today: dayjs().startOf('date').valueOf(),
    yesterday: dayjs().subtract(1, 'd').startOf('date').valueOf(),
    sevenDays: dayjs().subtract(7, 'd').endOf('date').valueOf()
  }
}