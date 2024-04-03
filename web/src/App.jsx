import { Routes, Route } from "react-router-dom";
import NavBar from "./layout/NavBar";
// - PAGES
import Home from "./pages/Home";
import NotFoundPage from "./pages/NoFoundPage";
import Movies from "./pages/Movies/Movies";
import TVShows from "./pages/TV_Shows/TVShows";
import DetailsMedia from "./pages/Details.Media";
import Login from "./pages/Login/Login";
import { Authenticated, Unauthenticated, } from "../src/components/Users/authenticated";
import SignUp from "./pages/SingUp/Singup";
import Profile from "./components/Users/Profile";
import User from "./pages/Users/User";
import Users from "./pages/Users/Users";
import PendingViews from "./pages/Users/PendingsViews/PendingsViews";
import Playlists from "./pages/Playlists/Playlists";
import PlaylistSingle from "./pages/Playlists/Playlist.Single";
import Forums from "./pages/Forum/Forums";
import ForumSingle from "./pages/Forum/Forum.Single";
import TVSeason from "./pages/TV_Shows/TVSeason";
import Footer from "./layout/Footer";
import TVEpisode from "./pages/TV_Shows/TVEpisode";
import Persons from "./pages/Person/Persons";
import Genres from "./pages/Genres/Genres";
import Keyword from "./pages/KeyWords/KeyWord";
import CompleteCast from "./pages/Person/CompletCast";
import BestRated from "./pages/Lists/BestRated";
import ListMedias from "./pages/Lists/ListMedias";
import ListMediasGenres from "./pages/Lists/ListMediasGenres";

function App() {
  return (
    <div className="mx-2 lg:mx-16 xl:mx-20 mt-5">
      <NavBar />
      <Routes>
        <Route index element={<Home />} />
        <Route
          path="/login"
          element={
            <Unauthenticated>
              <Login />
            </Unauthenticated>
          }
        />
        <Route
          path="/signup"
          element={
            <Unauthenticated>
              <SignUp />
            </Unauthenticated>
          }
        />
        <Route path="/movie" element={<Movies />} />
        <Route path="/tv" element={<TVShows />} />
        <Route path="/:media_type/:id" element={<DetailsMedia />} />
        <Route path="/:media_type/:idMedia/person/:id" element={<Persons />} />
        <Route path="/:media_type/:id/credits" element={<CompleteCast />} />
        <Route path="/:media_type/:id/genre/:idGenre" element={<Genres />} />
        <Route
          path="/:media/:id/genre/:idGenre/listMovies"
          element={<ListMediasGenres />}
        />
        <Route
          path="/:media/:id/genre/:idGenre/listTvShows"
          element={<ListMediasGenres />}
        />
        <Route
          path="/:media_type/:id/keyword/:idkeyword"
          element={<Keyword />}
        />
        {/* // < TV SHOWS */}
        <Route path="/tv/:idTv/:NSeason" element={<TVSeason />} />
        <Route path="/tv/:idTv/:NSeason/:idEpisode" element={<TVEpisode />} />
        {/* // < PERSONS */}
        <Route path="/person/:id" element={<Persons />} />
        <Route path="/:media/:id/bestRated" element={<BestRated />} />
        <Route path="/:media/:id/listMovies" element={<ListMedias />} />
        <Route path="/:media/:id/listTvShows" element={<ListMedias />} />
        {/* // < USER */}
        <Route
          path="/me"
          element={
            <Authenticated>
              <Profile />
            </Authenticated>
          }
        />
        <Route
          path="/users/:id"
          element={
            <Authenticated>
              <User />
            </Authenticated>
          }
        />
        <Route
          path="/users"
          element={
            <Authenticated>
              <Users />
            </Authenticated>
          }
        />
        <Route
          path="/pending/:id"
          element={
            <Authenticated>
              <PendingViews />
            </Authenticated>
          }
        />
        <Route
          path="/view/:id"
          element={
            <Authenticated>
              <PendingViews />
            </Authenticated>
          }
        />
        {/* // < PLAYLIST */}
        <Route
          path="/playlists/:userId"
          element={
            <Authenticated>
              <Playlists />
            </Authenticated>
          }
        />
        <Route
          path="/playlists/:userId/:id"
          element={
            <Authenticated>
              <PlaylistSingle />
            </Authenticated>
          }
        />
        {/* // < FORUM */}
        <Route
          path="/forums"
          element={
            <Authenticated>
              <Forums />
            </Authenticated>
          }
        />
        <Route
          path="/forums/:id"
          element={
            <Authenticated>
              <ForumSingle />
            </Authenticated>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
