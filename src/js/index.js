import React, {Component, PureComponent, Fragment} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const initialState = {
    colors: []
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
const ADD_COLOR = 'ADD_COLOR'

// action creators
const colorAdd = value => ({
    type: ADD_COLOR,
    payload: value,
})

// reducers
const reducer = (state, action) => {

    switch(action.type) {

        case ADD_COLOR:

            // копируем стейт что бы не мутировать исходный
            return {
                ...state,
                currentInterval: action.payload
            }
        default:

            return {}
    }
}

const ColorForm = ({onAddNewColor}) => {
    let _title, _color
    const submit = e => {
        e.preventDefault();

        if (typeof onAddNewColor === "function") {

            onAddNewColor(_title.value, _color.value);
        }

        e.target.reset();
    }
    return (
        <form onSubmit={submit}>
            <div className={'color-form'}>
                <input ref={input => _title = input} className={'color-form__title'} type="text" placeholder={'Color title'} required={true}/>
                <input ref={input => _color = input} className={'color-form__color'} type="color" required={true}/>
                <input className={'color-form__button'} type="submit" value={'Add color'} />
            </div>
        </form>
    )
}

ColorForm.propTypes = {
    onAddNewColor: PropTypes.func.isRequired
}

ColorForm.defaultProps = {
    onAddNewColor: f => f
}

const ColorItem = ({title, color}) => {
    let style = {'backgroundColor': color, 'height': '25px'}
    return (
        <div style={{'borderColor': color}} className={'color-item'}>
            <p>{title}</p>
            <div style={style}></div>
        </div>
    )
}

class ColorOrganizer extends React.PureComponent {

    state = {
        colors: [
            {
                title: 'color1',
                color: '#ddffee'
            },
            {
                title: 'color2',
                color: '#cedfee'
            }
        ]
    }

    onAddNewColors = (title, color) => {

        if (color && title) {
                console.log([...this.state.colors, {title, color}])
            this.setState({colors: [...this.state.colors, {title, color}]})
        }
    }

    render () {

        return (

            <div className={'color-organizer'}>
                <ColorForm onAddNewColor={this.onAddNewColors} />
                <div className={'color-items'}>
                    {
                        this.state.colors.map((colorItem, key) => (
                            <ColorItem key={`color-${key}`} {...colorItem} />
                        ))
                    }
                </div>
            </div>
        )
    }
}

// const Timer = connect(
//     (state, props) => ({
//         ...props,
//         currentInterval: state.currentInterval,
//     }),
//     dispatch => ({
//         changeInterval: value => {
//
//             dispatch(changeInterval(value))
//         }
//     })
// )(TimerComponent)

// init
// ReactDOM.render(
//     <Provider store={createStore(reducer, initialState)}>
//         <Timer />
//     </Provider>,
//     document.getElementById('app')
// )

ReactDOM.render(
    <ColorOrganizer />,
    document.getElementById('app')
)
