export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
};

export type User = {
  id: string;
  username: string;
  email: string;
  account_type: boolean;
};

export type Conversation = {
  id: string;
  user1: string;
  user2: string;
  user1_profile: User;
  user2_profile: User;
};

export type Invite = {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accept";
};