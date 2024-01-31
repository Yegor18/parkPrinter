// для вычленения данных из запроса
export const unwrap = (model_instance) => {
  try {
    return JSON.parse(JSON.stringify(model_instance))
  } catch (error) {
    console.log(error)
  }
}