import React from 'react'
import './Home.css'
import { Logo } from '../images/Netflix'
import { useState } from 'react'
import {
  ConnectButton,
  Icon,
  TabList,
  Tab,
  Button,
  Modal,
  useNotification,
} from 'web3uikit'
import { movies } from '../helpers/library'
import { Link } from 'react-router-dom'
import { useMoralis } from 'react-moralis'
import { useEffect } from 'react'
import { async } from 'q'

const Home = () => {
  const [visible, setVisible] = useState(false)
  const [selectedFilm, setSelectedFilm] = useState()
  const [myMovies, setMyMovies] = useState()
  const { isAuthenticated, Moralis, account } = useMoralis()

  useEffect(() => {
    async function fetchMyList() {
      await Moralis.start({
        serverUrl: 'https://nfjsdkrngmwt.usemoralis.com:2053/server',
        appId: 'I8czDsxI8Y9ngUOIKcy3Ou0eKvnyJfBr46OgXGg0',
      }) //if getting errors add this
      const theList = await Moralis.Cloud.run('getMyList', { addrs: account })

      const filterdA = movies.filter(function (e) {
        return theList.indexOf(e.Name) > -1
      })

      setMyMovies(filterdA)
    }

    fetchMyList()
  }, [account])

  const dispatch = useNotification()

  const handleNotification = () => {
    dispatch({
      type: 'error',
      message: 'Please connect Your Crypto Wallet',
      title: 'Not Authenticated',
      position: 'topL',
    })
  }
  const handleAddNotification = () => {
    dispatch({
      type: 'success',
      message: 'Movie added to List',
      title: 'Success',
      position: 'topL',
    })
  }
  return (
    <>
      <div className="logo">
        <Logo />
      </div>
      <div className="connect">
        <Icon fill="#ffffff" size={24} svg="bell" />
        <ConnectButton />
      </div>

      <div className="topBanner">
        <TabList defaultActiveKey={1} tabStyle="bar">
          <Tab tabKey={1} tabName={'Movies'}>
            <div className="scene">
              <img src={movies[0].Scene} className="sceneImg" alt="img"></img>
              <img src={movies[0].Logo} className="sceneLogo" alt="img"></img>
              <p className="sceneDesc">{movies[0].Description}</p>
              <div className="playButton">
                <Button
                  icon="chevronRightX2"
                  text="Play"
                  theme="secondary"
                  type="button"
                />
                <Button
                  icon="plus"
                  text="Add to My List"
                  theme="translucent"
                  type="button"
                />
              </div>
            </div>
            <div className="title">Movies</div>
            <div className="thumbs">
              {movies &&
                movies.map((e) => {
                  return (
                    <img
                      src={e.Thumnbnail}
                      className="thumbnail"
                      alt={e.Thumnbnail}
                      key={e.name}
                      onClick={() => {
                        setVisible(true)
                        setSelectedFilm(e)
                      }}
                    ></img>
                  )
                })}
            </div>
          </Tab>
          <Tab tabKey={2} tabName={'Series'}></Tab>
          <Tab tabKey={3} tabName={'My List'}>
            <div className="ownListContent">
              <div className="title">Your Library</div>
              {myMovies && isAuthenticated ? (
                <>
                  <div className="ownThumbs">
                    {myMovies &&
                      myMovies.map((e) => {
                        return (
                          <img
                            src={e.Thumnbnail}
                            className="thumbnail"
                            alt={e.Thumnbnail}
                            key={e.name}
                            onClick={() => {
                              setVisible(true)
                              setSelectedFilm(e)
                            }}
                          ></img>
                        )
                      })}
                  </div>
                </>
              ) : (
                <div className="ownThumbs">
                  You need to Authenticate To view your own list
                </div>
              )}
            </div>
          </Tab>
        </TabList>
        {selectedFilm && (
          <div className="modal">
            <Modal
              hasFooter={false}
              isVisible={visible}
              onCloseButtonPressed={() => setVisible(false)}
              width="1000px"
            >
              <div className="modalContent">
                <img
                  src={selectedFilm.Scene}
                  className="modalImg"
                  alt="img"
                ></img>
                <img
                  src={selectedFilm.Logo}
                  className="modalLogo"
                  alt="img"
                ></img>
                <div className="modalPlayButton">
                  {isAuthenticated ? (
                    <>
                      <Link to="/player" state={selectedFilm.Movie}>
                        <Button
                          icon="chevronRightX2"
                          text="Play"
                          theme="secondary"
                          type="button"
                        />
                      </Link>
                      <Button
                        icon="plus"
                        text="Add to My List"
                        theme="translucent"
                        type="button"
                        onClick={async () => {
                          await Moralis.Cloud.run('updateMyList', {
                            addrs: account,
                            newFav: selectedFilm.Name,
                          })
                          handleAddNotification()
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Button
                        icon="chevronRightX2"
                        text="Play"
                        theme="secondary"
                        type="button"
                        onClick={handleNotification}
                      />
                      <Button
                        icon="plus"
                        text="Add to My List"
                        theme="translucent"
                        type="button"
                        onClick={handleNotification}
                      />
                    </>
                  )}
                </div>

                <div className="modalInfo">
                  <div className="description">
                    <div className="details">
                      <span>{selectedFilm.Year}</span>
                      <span>{selectedFilm.Duration}</span>
                    </div>
                    {selectedFilm.Description}
                  </div>
                  <div className="detailedInfo">
                    Genre:
                    <span className="deets">{selectedFilm.Genre}</span>
                    <br />
                    Actors:
                    <span className="deets">{selectedFilm.Actors}</span>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        )}
      </div>
    </>
  )
}

export default Home
