package models

type Profile struct {
	ID        string  `json:"id"`
	Username  *string `json:"username"`
	Email     *string `json:"email"`
	Phone     *string `json:"phone"`
	FullName  *string `json:"full_name"`
	AvatarURL *string `json:"avatar_url"`
	Role      string  `json:"role"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type ApiUser struct {
	ID       string  `json:"id"`
	Username string  `json:"username"`
	Email    *string `json:"email"`
	Role     string  `json:"role"`
}
