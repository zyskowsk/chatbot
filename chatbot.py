import random

HANDLE = 'bot'
APPOINTMENT_KEYWORD = 'appointment'
HISTORY_KEYWORD = 'history'

GREETING_MESSAGES = (
    'hi',
    'hello',
    'hey',
)
DEFAULT_MESSAGES = {
    'tell me about medical history': HISTORY_KEYWORD,
    'tell me how to book an appointment': APPOINTMENT_KEYWORD,
}

DEFAULT_RESPONSES = {
    HISTORY_KEYWORD: 'I can tell you all about medical history!  Or you can follow this guided tour.',
    APPOINTMENT_KEYWORD: 'I can tell you all about appointments!  Or you can follow this guided tour.',
}
GREETING_RESPONSE = 'Hi, how are you?'
FIRST_MISUNDERSTAND_RESPONSE = '''
    I\'m sorry, I didn\'t understand.
    But don\'t worry, I will keep track of
    all your questions and pass them on to
    a member of our support team who will
    get back to you as soon as possible
'''
MISUNDERSTAND_RESPONSES = (
    'Don\'t worry, I am still listening!',
    'I will pass this on to my human collegues',
    'Remember, you can always ask me default questions that I know a lot about!',
)
APPOINTMENT_HEARD_RESPONSE = '''
    I think I heard you mention appointments?  I can tell you all about how to book
    an appointment or look at your current appointments, or if you like you can click
    this message to view a guided tour!
'''

HISTORY_HEARD_RESPONSE = '''
    Did you mention medical history?  If you like I can explain to you how we keep track
    of your medical history and make it easy for you to gain insight into your own health.
    Or if you like you can click this message to follow a guided tour!
'''
SKIP_RESPONSE = 'SKIP'


class ChatBot(object):

    def __init__(self):
        self.misunderstandings = 0

    def _parse_input(self, input):
        components = [w.lower() for w in input.split(' ')]
        return  {
            'components': components,
            'human_readable': ' '.join(components),
        }

    def get_response(self, input):
        parsed_input = self._parse_input(input)
        first_word = parsed_input['components'][0]
        parsed_input
        human_readable = parsed_input['human_readable']

        message = None
        tour = None
        if first_word in GREETING_MESSAGES:
            message = GREETING_RESPONSE
        elif human_readable in DEFAULT_MESSAGES:
            tour = DEFAULT_MESSAGES[human_readable]
            message = DEFAULT_RESPONSES[tour]
        elif APPOINTMENT_KEYWORD in human_readable:
            message = APPOINTMENT_HEARD_RESPONSE
            tour = APPOINTMENT_KEYWORD
        elif HISTORY_KEYWORD in human_readable:
            message = HISTORY_HEARD_RESPONSE
            tour = HISTORY_KEYWORD
        else:
            message = FIRST_MISUNDERSTAND_RESPONSE
            if self.misunderstandings > 0:
                message = SKIP_RESPONSE
                if self.misunderstandings % 5 == 0:
                    message = random.choice(MISUNDERSTAND_RESPONSES)
            # Increment and reset misunderstandings after 15
            self.misunderstandings += 1
            self.misunderstandings %= 15

        response = {
            'handle': HANDLE,
            'message': message,
        }
        if tour:
            response['tour'] = tour

        return response
