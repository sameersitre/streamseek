/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { Component } from 'react'
import apiCall from '../../../services/apiCall';
import { trendingURL } from '../../../services/apiURL'
import MediaList from '../../common/MediaList'
import { withRouter } from 'react-router-dom';
class Dashboard extends Component {

    state = {
        dataList: [],
        refresh: false,
        pageNumber: this.props.match?.params && this.props.match.params.pageNumber,
    }

    async componentDidMount() {
        try {
            if (this.props.match?.params.routedFrom) {
                localStorage.setItem("routedFrom", this.props.match.params.routedFrom)
            }
            this.props.history.push({ pathname: `/all/page1` }) //to change the default route
            window.scrollTo(0, 0)
            this.setState({ refresh: true })
            console.log(process.env)
            let data = { page: 1, media_type: "all" }
            let apiData = await apiCall(trendingURL, data)
            this.setState({ dataList: apiData.results, refresh: false })
        } catch (error) {
            console.log(error)
        }

    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.pageNumber !== this.state.pageNumber) {
            try {
                let data = { page: this.props.match.params.pageNumber, media_type: "all" }
                let apiData = await apiCall(trendingURL, data)
                this.setState({
                    dataList: apiData.results,
                    pageNumber: this.props.match.params.pageNumber,
                    refresh: false
                })
            } catch (error) {
                console.log(error)
            }

        }
    }

    pageNavigate = (value) => {
        window.scrollTo(0, 0)
        this.setState({ pageNumber: value })
        this.props.history.push({ pathname: `/all/page${value}` })
    }

    previous = () => { this.pageNavigate(parseInt(this.props.match.params.pageNumber) - 1) }
    next = () => { this.pageNavigate(parseInt(this.props.match.params.pageNumber) + 1) }

    render() {
        const { dataList, refresh } = this.state
        return (
            <MediaList
                listData={dataList}
                refresh={refresh}
                previous={this.previous}
                next={this.next}
            />
        )
    }
}
export default withRouter(Dashboard) 