import TwRouter from '../../common/route/tw.router';
import ChatbotCounselController from './controllers/chatbot.counsel.controller';


class ChatbotRouter extends TwRouter {
  constructor() {
    super();    
    this.controllers.push({ url: '/counsel', controller: ChatbotCounselController });
  }
}

export default ChatbotRouter;
