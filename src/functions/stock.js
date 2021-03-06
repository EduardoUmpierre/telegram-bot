import { getGlobalQuote } from '../services/alphavantage';
import { setInlineKeyboard } from '../helpers/options';
import { formatValue } from '../helpers/currency';

const getChangeValue = (value, showIcon = false) => {
  const isNegative = value.includes('-');
  const response = isNegative ? value : `+${value}`;

  if (!showIcon) {
    return response;
  }

  const icon = isNegative ? '\u2B07\uFE0F' : '\u2B06\uFE0F';

  return `${icon} ${response}`;
};

const formatResponse = stock => {
  const name = stock['01. symbol'].split('.')[0];
  const price = formatValue(stock['05. price']);
  const change = getChangeValue(formatValue(stock['09. change']), true);
  const changePercent = getChangeValue(formatValue(stock['10. change percent']));

  return {
    response: `${name}\r\n${price} BRL\r\n${change} (${changePercent}%)`,
    options: setInlineKeyboard([
      {
        text: 'Ver mais informações',
        url: `https://app.tororadar.com.br/acoes/${name}/`,
      },
    ]),
  };
};

export const getStockData = async (bot, msg, match) => {
  const {
    chat: { id },
  } = msg;

  try {
    const { data } = await getGlobalQuote(match[1]);

    if (Object.prototype.hasOwnProperty.call(data, 'Error Message')) {
      bot.sendMessage(id, 'Erro na requisição. Verifique o nome da ação e tente novamente.');
      return;
    }

    if (Object.prototype.hasOwnProperty.call(data, 'Note')) {
      bot.sendMessage(id, 'Limite de requisições atingido. Tente novamente em 1 minuto.');
      return;
    }

    const stock = data['Global Quote'];
    const { response, options } = formatResponse(stock);

    bot.sendMessage(id, response, options);
  } catch (e) {
    bot.sendMessage(id, 'Erro na requisição.');
  }
};
