/*
 * Author: Sameer Sitre
 * https://www.linkedin.com/in/sameersitre/
 * https://github.com/sameersitre
 * File Description:
 */

import React, { PureComponent } from "react"
import { withStyles } from "@material-ui/core/styles"
import Card from "@material-ui/core/Card"
import CardContent from "@material-ui/core/CardContent"
import Typography from "@material-ui/core/Typography"
import Grid from "@material-ui/core/Grid"
import moment from "moment"
import { connect } from "react-redux"
import { withRouter } from "react-router-dom"
import Poster from "./Poster.js"
import { event_GAnalytics } from "../../utils/Analytics"
const styles = (theme) => ({
  root: {
    width: "11rem",
    backgroundColor: "#101010",

  },
  CardContent: {
    // display: "flex",
    width: "9rem",
        backgroundColor: 'black',
    flexDirection: "column",
    position: "absolute",
    // paddingLeft: 10,
    borderBottomRightRadius: 5,
    borderBottomLeftRadius: 5,
  },
  chipView: {
    display: "flex",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(0.3),
    },
  },
})

class MediaCard extends PureComponent {
  state = {
    genreStrings: [],
    showCardContent: false,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.parentData) {
      return {
        parentData: nextProps.parentData,
        genres: nextProps.user.Genres,
      }
    }
  }

  componentDidMount() {
    this.getGenre()
  }

  getGenre = () => {
    if (this.state.genres && this.state.parentData.genre_ids) {
      let genres = this.state.genres.genres
      let propGenres = this.state.parentData.genre_ids
      let genreStrings = []
      propGenres.forEach((value) => {
        for (let j = 0; j < genres.length; j++) {
          if (value === genres[j].id) {
            genreStrings.push(genres[j].name)
          }
        }
      })
      this.setState({ genreStrings: genreStrings })
    }
  }

  cardClick = () => {
    event_GAnalytics("Card", "Click", this.state.parentData.original_title)
    localStorage.setItem(
      "selectedMovieDetails",
      JSON.stringify(this.state.parentData)
    )
    this.props.history.push({ pathname: `/details` })
  }

  render() {
    const { classes, showCardContent, enteredCardID } = this.props
    const { parentData, genreStrings } = this.state
    return (
      <Card className={classes.root} style={{
        boxShadow: enteredCardID === parentData.id ?
          '0 4px 15px 0 rgba(0, 0, 0, 0.6), 0 6px 20px 0 rgba(0, 0, 0, 0.19)' : 'none',
      }}>
        <div onClick={() => this.cardClick()}>
          <Poster data={parentData} />
        </div>

        {(showCardContent && (enteredCardID === parentData.id)) &&
          <CardContent className={classes.CardContent}>
            <Typography
              gutterBottom
              variant="caption"
              style={{
                color: "#E5CA49",
                fontSize: 11
              }}
            >
              {parentData.title || parentData.name}
            </Typography>
            <Grid
              style={{
                display: "flex",
                color: "#FFFFFF",
                flexDirection: "column",
              }}
            >
              <div>
                {parentData.vote_average !== 0 && (
                  <Typography style={{ fontSize: 11 }}>
                    {`${parentData.vote_average} (${parentData.vote_count})`}
                  </Typography>
                )}
                <Typography style={{ fontSize: 11 }}>
                  {moment(
                    parentData.release_date ||
                    parentData.first_air_date
                  ).format("LL")}
                </Typography>
              </div>
              <div
                style={{ display: "flex", flexDirection: "row", }}
              >
                <div className={classes.chipView}>
                  {genreStrings.map((value, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex', flexDirection: 'row',
                        alignItems: 'baseline', fontSize: 11
                      }}>
                      <Typography style={{ fontSize: 10 }}>{value}&nbsp;</Typography>

                      {i + 1 !== genreStrings.length ?
                        (
                          <Typography style={{ color: '#757575', fontSize: 10 }}>
                            &nbsp;|
                          </Typography>
                        ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </Grid>
          </CardContent>}
      </Card>
    )
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
})

export default withStyles(styles)(
  connect(mapStateToProps)(withRouter(MediaCard))
)
