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
import { filterURL } from '../../../services/apiURL'
import MediaList from '../../common/MediaList'

class Filter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataList: [],
            refresh: false,
            pageNumber: this.props.match.params.pageNumber,
            selectedGenres: ''
        }
    }

    async componentDidMount() {
        window.scrollTo(0, 0)
        this.setState({
            refresh: true,
            selectedGenres: this.props.user.genre_filter
        })
        let data = {
            page: 1,
            media_type: "movie",
            genres: this.props.user.genre_filter
        }
        let apiData = await apiCall(filterURL, data)
        this.setState({ dataList: apiData.results, refresh: false })
    }

    async componentDidUpdate(prevProps) {
        if (this.props.match.params.pageNumber !== this.state.pageNumber ||
            this.props.user.genre_filter !== this.state.selectedGenres
        ) {
            let data = {
                page: this.props.match.params.pageNumber,
                media_type: "movie",
                genres: this.props.user.genre_filter
            }
            let apiData = await apiCall(filterURL, data)
            this.setState({
                dataList: apiData.results,
                pageNumber: this.props.match.params.pageNumber,
                selectedGenres: this.props.user.genre_filter,
                refresh: false
            })
        }
    }

    pageNavigate = (value) => {
        window.scrollTo(0, 0)
        this.setState({ pageNumber: value })
        this.props.history.push({ pathname: `/filter/page${value}` })
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
export default (withRouter(connect(mapStateToProps, {})(Filter)));
