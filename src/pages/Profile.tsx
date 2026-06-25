import { useDiscord } from "../hooks/useDiscord";
import { ProfileCard } from "../components/ProfileCard";

export function Profile() {
  const { profile, loading, error, retry } = useDiscord();

  return (
    <main className="page" id="top">
      {loading && !profile && (
        <div className="card skeleton" aria-busy="true">
          <div className="banner banner--blank" />
          <div className="avatar-wrap">
            <div className="avatar skel-box" />
          </div>
          <div className="body">
            <div className="skel-line w60" />
            <div className="skel-line w40" />
            <div className="skel-line w80" />
          </div>
        </div>
      )}

      {error && !profile && (
        <div className="fallback">
          <h1>Profile unavailable</h1>
          <p className="mono">{error}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {profile && <ProfileCard profile={profile} />}
    </main>
  );
}
