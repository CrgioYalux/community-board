export type SessionData = {
  entity_id: number;
  affiliate_id: number;
  member_id: number;
  has_description: boolean;
  is_active: boolean;
  is_private: boolean;
};

export type SessionAccess = {
  token: string;
  expiresIn: string;
};

export type MemberExtended = {
  affiliate_id: number;
  member_id: number;
  username: string;
  email: string;
  fullname: string;
  bio: string;
  birthdate: Date;
  is_private: boolean;
  created_at: Date;
  followees: number;
  followers: number;
};

export type Post = {
  post_id: number;
  body: string;
  created_at: Date;
  times_saved: number;
  consultant_affiliate_id: number;
  saved_by_consultant: boolean;
  post_membership_affiliate_id: number;
  member_affiliate_id: number;
  fullname: string;
  username: string;
  member_is_private: boolean;
  member_followees: number;
  member_followers: number;
  board_affiliate_id: number;
  title: string;
  about: string;
  board_is_private: boolean;
  board_followers: number;
};

type MemberFromMemberPov = {
  follow_requested_by_consultant: boolean;
  is_consultant_allowed: boolean;
  consultant_member_id: number;
  username: string;
  affiliate_id: number;
  fullname: string;
  bio: string;
  birthdate: Date;
  is_private: boolean;
  followees: number;
  followers: number;
  created_at: Date;
};

type FollowRequest = {
  username: string;
  fullname: string;
  affiliate_id: number;
  follow_request_id: number;
  consultant_affiliate_id: number;
};

export namespace APIAction {
  type Result<T = undefined> =
    | {
        action: string;
        success: true;
        payload: T;
      }
    | {
        action: string;
        success: false;
        message: string;
      };

  namespace Auth {
    namespace Register {
      type Payload = {
        username: string;
        password: string;
        email: string;
        fullname: string;
      };
      type ResultSuccess = {
        created: true;
        payload: SessionData & SessionAccess;
      };
      type ResultFail = {
        created: false;
        message: string;
      };
      type Result = ResultSuccess | ResultFail;
    }
    namespace Login {
      type Payload = {
        username: string;
        password: string;
      };
      type ResultSuccess = {
        authenticated: true;
        payload: SessionData & SessionAccess;
      };
      type ResultFail = {
        authenticated: false;
        message: string;
      };
      type Result = ResultSuccess | ResultFail;
    }
    namespace Logout {
      type ResultSuccess = { done: true; payload: {} };
      type ResultFail = { done: false };
      type Result = ResultSuccess | ResultFail;
    }
    namespace Reauth {
      type ResultSuccess = { found: true; payload: MemberExtended };
      type ResultFail = { found: false; message: string };
      type Result = ResultSuccess | ResultFail;
    }
  }

  /* TODO */
  namespace Posts {
    namespace SwitchSave {
      type Payload = {
        post_id: number;
      };
      type Result = {
        done: boolean;
      };
    }
    namespace Create {
      type Payload = {
        body: string;
      };
      type Result =
        | {
            created: true;
            payload: {
              affiliates: { affiliate_id: number }[];
              entity_id: number;
              post_id: number;
            };
          }
        | {
            created: false;
            message: string;
          };
    }
    namespace Delete {
      type Payload = {
        post_id: number;
      };
      type Result =
        | {
            deleted: true;
          }
        | {
            deleted: false;
            message: string;
          };
    }
  }
  namespace Feed {
    namespace Get {
      type Result =
        | {
            found: true;
            payload: Post[];
          }
        | {
            found: false;
            message: string;
          };
    }
    namespace GetSaved {
      type Result =
        | {
            found: true;
            payload: Post[];
          }
        | {
            found: false;
            message: string;
          };
    }
    namespace GetFromAffiliateID {
      type Payload = {
        affiliate_id: number;
      };
      type Result =
        | {
            found: true;
            payload: Post[];
          }
        | {
            found: false;
            message: string;
          };
    }
  }

  namespace Members {
    namespace GetFromMemberPovByUsername {
      type Payload = {
        username: string;
      };

      type Result =
        | {
            found: true;
            payload: MemberFromMemberPov;
          }
        | {
            found: false;
            message: string;
          };
    }
    namespace Edit {
      type Payload = {
        fullname: string | null;
        is_private: boolean | null;
        bio: string | null;
        birthdate: string | null;
      };
      type Result =
        | {
            done: true;
          }
        | {
            done: false;
            message: string;
          };
    }
  }
  namespace Followers {
    namespace GetRequests {
      type Result =
        | {
            found: true;
            payload: FollowRequest[];
          }
        | {
            found: false;
            message: string;
          };
    }
    namespace AcceptRequest {
      type Payload = {
        follow_request_id: number;
      };
      type Result =
        | {
            done: true;
          }
        | {
            done: false;
            message: string;
          };
    }
    namespace DeclineRequest {
      type Payload = {
        follow_request_id: number;
      };
      type Result =
        | {
            done: true;
          }
        | {
            done: false;
            message: string;
          };
    }
    namespace Get {
      type Payload = {
        consultant_affiliate_id: number;
      };
      type Result =
        | {
            found: true;
            payload: FollowRequest[];
          }
        | {
            found: false;
            message: string;
          };
    }
  }

  namespace Followees {
    namespace Get {
      type Payload = {
        consultant_affiliate_id: number;
      };
      type Result =
        | {
            found: true;
            payload: FollowRequest[];
          }
        | {
            found: false;
            message: string;
          };
    }
  }

  namespace Affiliates {
    namespace Follow {
      type Payload = {
        affiliate_id: number;
      };
      type Result =
        | {
            done: true;
            payload: { follow_request_id: number };
          }
        | {
            done: false;
            message: string;
          };
    }
    namespace Unfollow {
      type Payload = {
        affiliate_id: number;
      };
      type Result =
        | {
            done: true;
          }
        | {
            done: false;
            message: string;
          };
    }
  }
}
