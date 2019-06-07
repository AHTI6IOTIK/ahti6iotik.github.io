import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// Slomux — упрощённая, сломанная реализация Flux.
// Перед вами небольшое приложение, написанное на React + Slomux.
// Это нерабочий секундомер с настройкой интервала обновления.

// Исправьте ошибки и потенциально проблемный код, почините приложение и прокомментируйте своё решение.

// При нажатии на "старт" должен запускаться секундомер и через заданный интервал времени увеличивать свое значение на значение интервала
// При нажатии на "стоп" секундомер должен останавливаться и сбрасывать свое значение

// задаем дефолтный стейт
const initialState = {
    currentInterval: 0
}

const createStore = (reducer, initialState) => {

    let currentState = initialState
    const listeners = []

    const getState = () => currentState
    const dispatch = action => {

        currentState = reducer(currentState, action)
        listeners.forEach(listener => listener())
    }

    const subscribe = listener => {

        // вернем функцию для отписки от отслеживания стора
        let currentNumber = listeners.push(listener)
        return () =>  listeners.splice(currentNumber-1, 1)
    }

    return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps = () => {}) =>
    Component => {
        class WrappedComponent extends React.Component {
            render() {
                return (
                    <Component
                        // this.props будет установлен через mapStateToProps
                        {...mapStateToProps(this.context.store.getState(), this.props)}
                        // в dispatch параметры передаются через actions creators
                        // по этому повторно this.props копировать не нужно
                        {...mapDispatchToProps(this.context.store.dispatch)}
                    />
                )
            }

            componentDidMount() {

                // при монтировании создадим метод unsSubscribe для возможности отписки компонента на стор
                this.unsSubscribe = this.context.store.subscribe(
                    () => this.forceUpdate()
                )
            }

            componentWillUnmount() {

                // при размонтировании компонента отписываем его от стора
                this.unsSubscribe();
            }

        }

        // Установим объект store обязательным
        WrappedComponent.contextTypes = {
            store: PropTypes.object.isRequired,
        }

        return WrappedComponent
    }

class Provider extends React.Component {

    getChildContext() {

        return {
            store: this.props.store,
        }
    }

    render() {

        return React.Children.only(this.props.children)
    }
}

// Установим объект store обязательным
Provider.childContextTypes = {
    store: PropTypes.object.isRequired,
}

// APP

// actions
const CHANGE_INTERVAL = 'CHANGE_INTERVAL'

// action creators
const changeInterval = value => ({
    type: CHANGE_INTERVAL,
    payload: value,
})

// reducers
const reducer = (state, action) => {

    switch(action.type) {

        case CHANGE_INTERVAL:

            // копируем стейт что бы не мутировать исходный
            return {
                ...state,
                currentInterval: action.payload
            }
        default:

            return {}
    }
}

// components

class IntervalComponent extends React.Component {

    render() {

        let {currentInterval} = this.props
        return (
            <div>
                <span>Интервал обновления секундомера: {currentInterval} сек.</span>
                <span>
                    <button onClick={() => this.changeInterval(this.timerDownTime(currentInterval))}>-</button>
                    <button onClick={() => this.changeInterval(this.timerUpTime(currentInterval))}>+</button>
                </span>
            </div>
        )
    }

    shouldComponentUpdate(nextProps) {

        // если currentInterval не изменился отменяем обновление
        return nextProps.currentInterval !== this.props.currentInterval
    }

    changeInterval = interval => {

        if (typeof this.props.changeInterval === 'function') {

            this.props.changeInterval(interval)
        }
    }

    timerUpTime = currentInterval => currentInterval + 1

    timerDownTime = currentInterval => currentInterval <= 0 ? 0 : currentInterval - 1
}

class StopwatchComponent extends React.Component {

    render() {
        let {currentTime} = this.props
        return (
            <div>
                <div>
                    Секундомер: {currentTime} сек.
                </div>
                <div>
                    <button disabled={currentTime > 0} onClick={this.handleStart}>Старт</button>
                    <button disabled={currentTime == 0} onClick={this.handleStop}>Стоп</button>
                </div>
            </div>
        )
    }

    shouldComponentUpdate(nextProps) {

        // если currentTime не изменился отменяем обновление
        return nextProps.currentTime !== this.props.currentTime
    }

    handleStart = () => {

        if (typeof this.props.handleStart === 'function') {

            this.props.handleStart()
        }
    }

    handleStop = () => {

        if (typeof this.props.handleStop === 'function') {

            this.props.handleStop()
        }
    }
}

const ErrorMessage = ({message}) => <div>
    <span>{message}</span>
</div>

class TimerComponent extends React.Component {

    state = {
        currentTime: 0,
        isSetInterval: true
    }

    render() {
        return (
            <div>
                {
                    !this.state.isSetInterval &&
                        <ErrorMessage message={'Установите таймер'}/>
                }
                <IntervalComponent currentInterval={this.props.currentInterval} changeInterval={this.changeInterval} />
                <StopwatchComponent currentTime={this.state.currentTime} handleStart={this.handleStart} handleStop={this.handleStop}/>
            </div>
        )
    }

    componentWillUnmount() {

        clearInterval(this.intervalID)
    }

    shouldComponentUpdate(nextProps, nextState) {

        // если currentTime или state не изменились отменяем обновление
        return nextProps.currentInterval !== this.props.currentInterval || nextState !== this.state
    }

    componentDidUpdate() {

        if (!this.state.isSetInterval && this.props.currentInterval > 0) {
            this.setState({isSetInterval: true})
        }
    }

    handleStart = () => {

        // Сохраним текущий интервал в замыкании
        let {currentInterval} = this.props

        if (currentInterval === 0) {

            this.setState({isSetInterval: false})
            return
        }

        if (typeof this.intervalID !== 'undefined' && this.intervalID > 0) {

            clearInterval(this.intervalID);
        }

        this.intervalID = setInterval(() => this.setState({
            currentTime: this.state.currentTime + currentInterval
        }), currentInterval * 1000)
    }

    handleStop = () => {

        clearInterval(this.intervalID)
        this.setState({ currentTime: 0 })
    }

    changeInterval = currentInterval => {

        if (typeof this.props.changeInterval === 'function') {

            this.props.changeInterval(currentInterval);
        }
    }

}

const Timer = connect(
    (state, props) => ({
        ...props,
        currentInterval: state.currentInterval,
    }),
    dispatch => ({
        changeInterval: value => {

            dispatch(changeInterval(value))
        }
    })
)(TimerComponent)

// init
ReactDOM.render(
    <Provider store={createStore(reducer, initialState)}>
        <Timer />
    </Provider>,
    document.getElementById('app')
)
