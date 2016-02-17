const div = CycleDOM.div;
const form = CycleDOM.form;
const input = CycleDOM.input;
const makeDOMDriver = CycleDOM.makeDOMDriver;
const makeHTTPDriver = CycleHTTPDriver.makeHTTPDriver;

const APP_CONTAINER_ID = '#app';
const SKIP_MESSAGE = 'SKIP';
const INITIAL_MESSAGE = {
    handle: 'bot',
    message: 'Welcome to the help bot!  I am here to answer all of your questions.  Feel free to ask me something, or click on one of the pre selected help topics',
}


function main(sources) {
    // Event stream transformations
    const defaultMessages$ = sources.DOM.select('.default_message').events('click')
        .map(ev => _user_message(_default_message(ev.target.innerText)));
    const toggleClicks$ = sources.DOM.select('.toggle').events('click');
    const tourIds$ = sources.DOM.select('.message_text.tour').events('click')
        .map(ev => ev.target.id);
    const tourCloses$ = sources.DOM.select('.tour .close').events('click')
        .map(() => null);
    const userSubmittedMessages$ = sources.DOM.select('.input_form').events('submit')
        .map(ev => _user_message(ev.target.firstChild.value));

    // Conversation state is an accumulated list of users messages
    // and response messages from the chatbot server.
    //
    // -[]-----[um, rm]-----[um, rm, um, rm]-------
    // 
    // message structure:
    //  {
    //      handle: <'user'/'bot'>,
    //      message: <string>,
    //  }
    //
    const userMessages$ = Rx.Observable.merge(userSubmittedMessages$, defaultMessages$);
    const responseMessages$ = sources.HTTP.switch().map(response => response.body)
        .filter(message_data => message_data.message !== SKIP_MESSAGE);
    const conversationState$ = Rx.Observable.merge(userMessages$, responseMessages$)
        .startWith([INITIAL_MESSAGE])
        .scan((conversation, newMessage) => {
            conversation.push(newMessage)
            return conversation
        });

    // Tour state is a stream of ids or null whertourCloses$ = e
    // the strings represent a specific guided tour
    //
    // -null--'history'-----null---'appointments'---
    // 
    const tourState$ = Rx.Observable.merge(tourIds$, tourCloses$)
        .startWith(null);

    // Toggle state is a sream of booleans which represents
    // the open/closed state of the chat window
    // 
    // -false-----true-----false------true----------
    // 
    const toggleState$ = toggleClicks$
        .map(ev => !ev.target.classList.contains('chat_open'))
        .startWith(false);

    const state$ = Rx.Observable.combineLatest(
        toggleState$,
        conversationState$,
        tourState$,
        (toggleClick, conversation, tour) => ({
            toggleClick,
            conversation,
            tour,
        })
    );

    return {
        DOM: state$.map(state => view(state)),
        FOCUS: toggleClicks$,
        CLEAR_INPUT: sources.DOM.select('.input_form').events('submit'),
        SCROLL: sources.DOM.select('.conversation').observable,
        HTTP: userMessages$.map(message_data => {
            return {
                url: '/chat',
                method: 'POST',
                send: {
                    message: message_data.message,
                },
            };
        }),
    };
}

// View functions 

function view(state) {
    return div([
        div('.header', [
            div('.tab-wrapper', [
                div('.tab .appointment', 'book an appointmet'),
                div(state.tour === 'appointment' ? '.tour' : '.tour .hidden', [
                    div('.close', 'x'),
                    div('Click here to see your appointments and schedule a new one.'),
                ]),
            ]),
            div('.tab-wrapper', [
                div('.tab .history', 'medical history'),
                div(state.tour === 'history' ? '.tour' : '.tour .hidden', [
                    div('.close', 'x'),
                    div('Click here to view your medical history.'),
                ]),
            ]),
        ]),
        div(state.toggleClick ? '.chat_container .chat_open': '.chat_container', [
            div(state.toggleClick ? '.toggle .chat_open' : '.toggle'),
            div('.screen', [
                div('.conversation', _renderConversation(state.conversation)),
            ]),
            div('.input_container', [
                div('.default_messages', [
                    div('.ask', 'ask about...'),
                    div('.default_message', 'medical history'),
                    div('.default_message', 'book an appointment'),
                ]),
                form('.input_form', {onsubmit: ev => ev.preventDefault()}, [
                    input('.chat_input', {
                        type: 'text',
                        placeholder: 'type some text...',
                    }),
                ]),
            ]),
        ]),
    ]);
}

function _renderConversation(conversation) {
    return conversation.map(data => {
        var message_selector = '.message_text';
        if (data.tour) {
            message_selector += ` .tour #${data.tour}`;
        }

        return div(`.message .${data.handle}`, [
            div('.handle', data.handle),
            div(message_selector, data.message),
            div('.clear'),
        ]);
    });
}

// Utility functions

function _default_message(text) {
    return messages = {
        'medical history': 'Tell me about medical history',
        'book an appointment': 'Tell me how to book an appointment',
    }[text];
};

function _user_message(message_text) {
    return {
        handle: 'user',
        message: message_text,
    };
}

// Custom drivers

function focusDriver(focused$) {
    focused$.subscribe(ev => {
        const par = ev.target.parentNode;
        const input_container = par.getElementsByClassName('input_container')[0];
        const input = input_container.getElementsByTagName('input')[0];
        if (ev.target.classList.contains('chat_open')) {
            input.focus();
        }
    })
    return Rx.Observable.empty();
}

function scrollDriver(scrolled$) {
    scrolled$.subscribe(el => {
        const conversation = el[0];
        if (conversation) {
            conversation.scrollTop = conversation.scrollHeight;
        }
    })
    return Rx.Observable.empty();
}

function clearInputDriver(submitted$) {
    submitted$.subscribe(ev => {
        ev.target.firstChild.value = '';
    })
    return Rx.Observable.empty();
}

Cycle.run(main, {
    CLEAR_INPUT: clearInputDriver,
    DOM: makeDOMDriver(APP_CONTAINER_ID),
    FOCUS: focusDriver,
    HTTP: makeHTTPDriver(),
    SCROLL: scrollDriver,
});
