import fs from 'fs';
import path from 'path';
import axios from 'axios';

function formattingPrice(price) {
  if (!price || price == 'null') return 0 + ' ₽'
  return Number(price).toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const formattingRules = {
  price: formattingPrice,
};

async function genRoomPages() {
  const __dirname = path.resolve();
  const { info, error, success } = app.log;

  try {
    const calculatorDirPath = path.resolve(__dirname, './dist/calculator');
    if (!fs.existsSync(calculatorDirPath)) {
      fs.mkdirSync(calculatorDirPath, { recursive: true });
    }

    const response = await axios.get('https://mesto-store.ru/_get_all_rooms_')

    if (response.status !== 200) throw new Error(response.statusText);
    const { rooms } = response.data;

    if (!rooms.length) return null

    rooms.forEach(room => {
      const templateFilePath = path.resolve(__dirname, `./src/template/ready/template-room-w-${room.warehouse_id}.html`);

      let fileContents = fs.readFileSync(templateFilePath, { encoding: 'utf-8' })

      // Замена ключей $$key на данные из room
      Object.keys(room).forEach((key) => {
        const value = room[key] !== null ? room[key].toString() : ''; // Значение ключа

        const formatter = formattingRules.hasOwnProperty(key);
        const formattedValue = formatter ? formattingRules[key](value) : value;

        // Заменяем все вхождения ключа в содержимом файла
        fileContents = fileContents.replace(new RegExp(`\\$\\$${key}`, 'g'), formattedValue);
      });

      // Создание директории, если её нет
      const dirPath = path.resolve(__dirname, `./dist/calculator/${room.warehouse_id}`);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const fileName = `room-${room.room_name}.html`; // Название файла
      fs.writeFileSync(path.resolve(dirPath, fileName), fileContents);
    })

    info(`${rooms.length} страниц создано`)
  } catch (error) {
    app.log.error(error.message)
    throw error
  }
}


export default genRoomPages