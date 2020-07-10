import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const Alert = ({ alerts }) =>

    alerts != null &&
    alerts.length > 0 &&
    alerts.map(alert =>
        <div key={alert.id} className={`alert alert-${alert.alertType}`}>
            {alert.msg}
        </div>)
console.log('here..', alert)

Alert.propTypes = {
    alerts: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    alert: state.alert
})

export default connect(mapStateToProps)(Alert)
