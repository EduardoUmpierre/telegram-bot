import { getSubredditGallery } from '../services/imgur';
import { FILE_TYPE, CALLBACK_TYPE } from '../helpers/constants';
import { getCurrencyMessage } from './currency';

/**
 * Returns the image list
 * @param {Object} bot - Bot instance
 * @param {Object} request - inline_query event
 */
export const getInlineResult = async (bot, request) => {
  const { id, query } = request;

  if (query) {
    const response = await getSubredditGallery(query);

    const {
      data: { data },
    } = response;

    bot.answerInlineQuery(
      id,
      data
        .filter(
          item => !item.is_album && (item.type === FILE_TYPE.PHOTO || item.type === FILE_TYPE.GIF)
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 20)
        .map(item => {
          const type = item.type === FILE_TYPE.PHOTO ? 'photo' : 'gif';

          return {
            type,
            id: item.id,
            [`${type}_url`]: item.link,
            thumb_url: item.link,
            title: item.title || '',
            description: item.description || '',
          };
        })
    );
  }
};

/**
 * Returns the response based on data type
 * @param {Object} bot - Bot instance
 * @param {Object} data - callback_query event
 */
export const getCallbackResult = (bot, { id, data }) => {
  const parsedData = JSON.parse(data);

  switch (parsedData.type) {
    case CALLBACK_TYPE.CURRENCY:
      bot.answerCallbackQuery(id, { text: getCurrencyMessage(parsedData) });
      break;
    default:
      bot.answerCallbackQuery(id, 'Comando não identificado, tente novamente.');
      break;
  }
};
