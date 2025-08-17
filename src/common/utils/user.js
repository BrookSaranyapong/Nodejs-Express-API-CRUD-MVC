function mapUser(u) {
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

module.exports = { mapUser };
