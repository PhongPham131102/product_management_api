export const roleDefault = [
  {
    _id: '659ba7c62b611171a5347a97',
    name: 'Supper Admin',
  },
];
export const permisstionDefault = [
  {
    _id: '65a0a995aa7ea10ac4d16961',
    role: '659ba7c62b611171a5347a97',
    action: ['manage'],
    subject: 'all',
  },
];
export const adminRole = '659ba7c62b611171a5347a97';
export const usersDefault = [
  {
    _id: '6604de8ae5068069a1bbb592',
    username: 'admin',
    password: '$2a$12$1Pd71qAAxmMafUbTJxFZduVlGQDNOFXIFEF8/VYTmROrZJDritdmu',
    name: 'Admin',
    email: 'admin@gmail.com',
    role: '659ba7c62b611171a5347a97',
    isDelete: false,
  },
];

export const subjectMapping = {
  all: 'Tất cả',
  user: 'Người dùng',
  video: 'Video',
  role: 'Quyền hạn',
  team: 'Team',
  log: 'Log',
  token: 'Token',
};
export const actionMapping = {
  create: 'Tạo',
  read: 'Đọc',
  update: 'Cập nhật',
  delete: 'Xóa',
  manage: 'Toàn quyền',
};
