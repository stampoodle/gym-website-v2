import { useState } from 'react'
import { useProfile } from '../context/ProfileContext'

export default function Profile() {
  const { profile, updateProfile } = useProfile()
  const [name, setName] = useState(profile.name)
  const [email, setEmail] = useState(profile.email)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    updateProfile({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="page-stack">
      <header className="page-head">
        <div>
          <p className="page-head__eyebrow">Profile</p>
          <h1 className="page-head__title">Your details</h1>
        </div>
      </header>

      <p className="profile-note">
        There's no account system connected yet — what you enter here is
        stored only in this browser, as a stand-in for a real profile.
      </p>

      <section className="section-block">
        <div className="form-card">
          <label className="field">
            <span className="field__label">Name</span>
            <input
              className="input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <span className="field__hint">
              Placeholder for now — this isn't tied to a real account yet.
            </span>
          </label>

          <button className="btn btn--solid" type="button" onClick={handleSave}>
            {saved ? 'Saved' : 'Save changes'}
          </button>
        </div>
      </section>

      <section className="section-block">
        <div className="section-block__head">
          <h2>Preferences</h2>
        </div>
        <div className="form-card">
          <label className="field field--row">
            <span className="field__label">Weight unit</span>
            <div className="segmented">
              <button
                type="button"
                className={
                  'segmented__option' +
                  (profile.unit === 'kg' ? ' segmented__option--active' : '')
                }
                onClick={() => updateProfile({ unit: 'kg' })}
              >
                kg
              </button>
              <button
                type="button"
                className={
                  'segmented__option' +
                  (profile.unit === 'lb' ? ' segmented__option--active' : '')
                }
                onClick={() => updateProfile({ unit: 'lb' })}
              >
                lb
              </button>
            </div>
          </label>
          <p className="field__hint">
            Saved, but not yet applied everywhere — all numbers are shown in
            kg for now.
          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="form-card form-card--danger">
          <div>
            <p className="field__label">Account</p>
            <p className="field__hint">
              Sign-in isn't connected yet, so there's nothing to log out of.
            </p>
          </div>
          <button className="btn btn--outline" type="button" disabled>
            Log out
          </button>
        </div>
      </section>
    </div>
  )
}
