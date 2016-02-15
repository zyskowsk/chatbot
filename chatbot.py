#!/usr/bin/python

import random


# COMMANDS
EXIT_COMMAND = 'exit'

# INPUTS
GREETING_INPUTS = (
    'hi',
    'hello',
    'hey',
)

# RESPONSES
EXIT_RESPONSE = 'Bye!'
GREETING_RESPONSE = 'Hi, how are you?'
MAX_MISUNDERSTANDING_RESPONSE = 'I am sorry, we clearly do not speak the same language, goodbye!'
MISUNDERSTAND_RESPONSES = (
    'I am sorry, I don\'t understand',
    'What?',
    'Sorry, I don\'t follow?',
    'I beg your pardon?',
)

class ChatBot(object):

    def __init__(self):
        self.misunderstandings = 0

    def _parse_input(self, input):
        parsed_input = [w.lower() for w in input.split(' ')]
        return parsed_input

    def _get_response(self, parsed_input):
        first_word = parsed_input[0]
        response = None
        if first_word in GREETING_INPUTS:
            response = GREETING_RESPONSE
        elif len(parsed_input) == 1 and first_word == EXIT_COMMAND:
            response = EXIT_RESPONSE
        else:
            self.misunderstandings += 1
            response = random.choice(MISUNDERSTAND_RESPONSES)
        return response

    def main(self):
        should_continue = True
        while should_continue:
            response = self._get_response(self._parse_input(raw_input(':: ')))
            if self.misunderstandings > 10:
                response = MAX_MISUNDERSTANDING_RESPONSE
                should_continue = False
            if response == EXIT_RESPONSE:
                should_continue = False
            print response

if __name__ == '__main__':
    ChatBot().main()
