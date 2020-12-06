import React from 'react'
import { connect } from 'react-redux'

export const mapStateToProps = state => ({

})

export const mapDispatchToProps = {

}

export const hocWrapper = (WrappedComponent) => {
    const hocComponent = ({ ...props }) => <WrappedComponent {...props} />

    hocComponent.propTypes = {
    }
    return hocComponent
}

export default WrapperComponent => connect(mapStateToProps, mapDispatchToProps)(hocWrapper(WrapperComponent))
