/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import apiCall from '../../../services/apiCall';
import { trendingURL } from '../../../services/apiURL'
import MediaList from '../../common/MediaList'

class Movies extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
            refresh: false,
            pageNumber: this.props.match.params.pageNumber,
        }
    }

    async componentDidMount() {
        window.scrollTo(0, 0)
        this.setState({ refresh: true })
        let data = { page: 1, media_type: "movie" }
        let apiData = await apiCall(trendingURL, data)
        this.setState({ dataList: apiData.results, refresh: false })
    }

    async componentDidUpdate(prevProps) {
        if (this.props.match.params.pageNumber !== this.state.pageNumber) {
            let data = { page: this.props.match.params.pageNumber, media_type: "movie" }
            let apiData = await apiCall(trendingURL, data)
            this.setState({
                dataList: apiData.results,
                pageNumber: this.props.match.params.pageNumber,
                refresh: false
            })
        }
    }

    pageNavigate = (value) => {
        window.scrollTo(0, 0)
        this.setState({ pageNumber: value })
        this.props.history.push({ pathname: `/movies/page${value}` })
    }
    previous = () => { this.pageNavigate(parseInt(this.props.match.params.pageNumber) - 1) }

    next = () => { this.pageNavigate(parseInt(this.props.match.params.pageNumber) + 1) }

    render() {
        const { dataList, refresh } = this.state
        return (
            <div>
                <MediaList
                    listData={dataList}
                    refresh={refresh}
                    previous={this.previous}
                    next={this.next}
                />
            </div>
        )
    }
}
export default withRouter(Movies)