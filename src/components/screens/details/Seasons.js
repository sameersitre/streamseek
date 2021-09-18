import React, { useState, useEffect } from 'react'
import './Seasons.css'
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Button from "@material-ui/core/Button"
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import Typography from '@material-ui/core/Typography';
import EpisodesModal from './EpisodesModal'
function Seasons(props) {
    const myRef = React.createRef();
    const [seasonEpoisodes, setseasonEpisodes] = useState();
    const [selectedSeason, setselectedSeason] = useState();
    const [modalOpen, setmodalOpen] = useState(false)
    const [leftBtnHidden, setleftBtnHidden] = useState(true)
    const [rightBtnHidden, setrightBtnHidden] = useState(false)
    useEffect(() => {
        setseasonEpisodes()
    }, []);

    const scroll = (scrollOffset) => {
        myRef.current.scrollLeft += scrollOffset;
    };

    const handleModal = (val) => {
        setmodalOpen(val)
    }

    const handleClick = (params) => {

        setselectedSeason(params)
        handleModal(true)
    }
    const handleScroll = (e) => {
        const rightend = e.target.scrollWidth - e.target.scrollLeft === e.target.clientWidth;
        if (rightend) {
            setrightBtnHidden(true)
            console.log('end reached')
        }
        else
            setrightBtnHidden(false)

        if (e.target.scrollLeft === 0) {
            setleftBtnHidden(true)
        }
        else
            setleftBtnHidden(false)
    }
    return (
        props.parentData.seasons ?
            <Grid style={{ marginTop: 15, marginBottom: 15, }}   >
                <div>
                    {selectedSeason && <EpisodesModal parentData={selectedSeason} modalOpen={handleModal} isOpen={modalOpen} />}
                    <Typography variant="subtitle2">Seasons:</Typography>
                    <div style={{ display: 'flex', alignSelf: 'center', }}>
                        <Hidden xsDown>
                            <Button style={{
                                display: leftBtnHidden ? 'none' : 'block',
                                float: 'left', position: 'absolute',
                                height: 230, width: 50, zIndex: 2,
                                backgroundColor: 'rgba(0,0,0, 0.6)',
                                color: '#FFFFFF'
                            }} onClick={() => scroll(-250)}><ArrowBackIos /></Button>
                        </Hidden>
                        <div className='root' ref={myRef} onScroll={handleScroll}>
                            {props.parentData.seasons.map((item, i) =>
                                <div key={i} className="maincard" onClick={() => handleClick(item)}>

                                    <img
                                        className="poster"
                                        src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                                        alt=""
                                    />
                                    <div className="castinfo" >
                                        <Typography variant="subtitle2">
                                            {item.name}
                                        </Typography>
                                        <Typography variant="caption">
                                            {item.character}
                                        </Typography>
                                    </div>
                                </div>)
                            }
                        </div>
                        <Hidden xsDown>
                            <Button
                                style={{
                                    display: rightBtnHidden ? 'none' : 'block',
                                    float: 'right', right: 0, position: 'absolute', zIndex: 2,
                                    height: 230,
                                    backgroundColor: 'rgba(0,0,0, 0.6)', color: '#FFFFFF'
                                }} onClick={() => scroll(+250)}><ArrowForwardIos /></Button>
                        </Hidden>
                    </div>
                </div>
            </Grid>
            : null


    )
}

export default Seasons
