/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import apiCall from '../../../services/apiCall';
import MediaList from '../../common/MediaList'
import { testURL } from '../../../services/apiURL'

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

        this.setState({ refresh: true })
        let apiData = await apiCall(testURL, null)
        this.setState({ dataList: apiData.results, refresh: false })
    }

    pageNavigate = (value) => {
        window.scrollTo(0, 0)
        this.setState({ pageNumber: value })
        this.props.history.push({ pathname: `/test/page${value}` })
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