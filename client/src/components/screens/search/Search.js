/*
  * Author: Sameer Sitre
  * https://www.linkedin.com/in/sameersitre/
  * https://github.com/sameersitre
  * File Description:  
 */
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../../services/apiCall';
import { searchURL } from '../../../services/apiURL'
import MediaList from '../../common/MediaList'
class Search extends Component {
    state = {
        dataList: [],
        refresh: false,
        pageNumber: this.props.match.params.pageNumber,
        searchText: ''
    }

    async componentDidMount() {
        window.scrollTo(0, 0)
        this.getData()
    }

    async componentDidUpdate(prevProps) {
        if ((this.props.match.params.pageNumber !== this.state.pageNumber)) {
            this.getData()
        }
    }

    getData = async () => {
        this.setState({
            searchText: this.props.user.search_text,
            pageNumber: this.props.match.params.pageNumber
        })
        let data = {
            searchText: this.props.user.search_text,
            page: this.props.match.params.pageNumber,
        }
        let apiData = await apiCall(searchURL, data)
        this.setState({
            dataList: apiData.results,
            refresh: false
        })
    }

    pageNavigate = (value) => {
        window.scrollTo(0, 0)
        this.setState({ pageNumber: value })
        this.props.history.push({ pathname: `/search/page${value}` })
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
const mapStateToProps = state => ({ user: state.user })

export default (withRouter(connect(mapStateToProps, {})(Search)));
