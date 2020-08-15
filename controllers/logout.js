//
// ─── HANDLE LOGOUT ──────────────────────────────────────────────────────────────
//

exports.handleLogout = (req, res) => {
  req.logout();
  res.redirect("/login");
};
